import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.userProfile.findUnique({
      where: { email },
    });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.userProfile.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user profile
    const user = await this.prisma.userProfile.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    // Generate JWT tokens
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
        },
      },
    };
  }

  async login(user: any) {
    // User is already validated by PassportJS Local Strategy
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
        },
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      
      // Get user from database
      const user = await this.prisma.userProfile.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newPayload = { sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const refresh_token = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      return {
        access_token,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: {
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
          },
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      user_metadata: {
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async validateGoogleUser(googleUser: any) {
    const { email, firstName, lastName, avatarUrl, provider, providerId } = googleUser;

    // Check if user exists by email
    let user = await this.prisma.userProfile.findUnique({
      where: { email },
      include: {
        oauth_accounts: true,
      },
    });

    if (user) {
      // User exists, check if they have this OAuth account linked
      const existingOAuthAccount = user.oauth_accounts.find(
        (account) => account.provider === provider && account.providerId === providerId,
      );

      if (!existingOAuthAccount) {
        // Link the OAuth account to existing user
        await this.prisma.oAuthAccount.create({
          data: {
            provider,
            providerId,
            userId: user.id,
          },
        });
      }

      // Update user info if needed
      if (!user.avatarUrl && avatarUrl) {
        await this.prisma.userProfile.update({
          where: { id: user.id },
          data: { avatarUrl },
        });
        user.avatarUrl = avatarUrl;
      }
    } else {
      // Create new user with OAuth account
      user = await this.prisma.userProfile.create({
        data: {
          email,
          firstName,
          lastName,
          avatarUrl,
          oauth_accounts: {
            create: {
              provider,
              providerId,
            },
          },
        },
        include: {
          oauth_accounts: true,
        },
      });
    }

    // Generate JWT tokens
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
        },
      },
    };
  }

}