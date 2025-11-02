import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { generateWorkspaceNameAndSlug } from '../utils/name-generator';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
    const workspace = await this.prisma.workspace.create({
      data: {
        ...createWorkspaceDto,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return workspace;
  }

  async createDefaultWorkspace(userId: string) {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { name, slug } = generateWorkspaceNameAndSlug(true);
      
      try {
        // Check if slug already exists
        const existingWorkspace = await this.prisma.workspace.findUnique({
          where: { slug },
        });

        if (existingWorkspace) {
          attempts++;
          continue;
        }

        // Create workspace with generated name and slug
        const workspace = await this.prisma.workspace.create({
          data: {
            name,
            slug,
            description: `Your default workspace - ${name}`,
            isActive: true,
            members: {
              create: {
                userId,
                role: 'owner',
              },
            },
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });

        return workspace;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error('Failed to create default workspace after multiple attempts');
        }
      }
    }

    throw new Error('Failed to create default workspace');
  }

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or access denied');
    }

    return workspace;
  }

  async findBySlug(slug: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        slug,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or access denied');
    }

    return workspace;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, userId: string) {
    // Check if user is owner or admin
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId,
        role: {
          in: ['owner', 'admin'],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check if user is owner
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId,
        role: 'owner',
      },
    });

    if (!member) {
      throw new ForbiddenException('Only workspace owner can delete workspace');
    }

    return this.prisma.workspace.delete({
      where: { id },
    });
  }

  async addMember(id: string, addMemberDto: AddMemberDto, userId: string) {
    // Check if user has permission to add members
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId,
        role: {
          in: ['owner', 'admin'],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Insufficient permissions to add members');
    }

    // Check if user exists
    const user = await this.prisma.userProfile.findUnique({
      where: { email: addMemberDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        userId: user.id,
      },
    });

    if (existingMember) {
      throw new ForbiddenException('User is already a member of this workspace');
    }

    return this.prisma.workspaceMember.create({
      data: {
        workspaceId: id,
        userId: user.id,
        role: addMemberDto.role || 'member',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async removeMember(workspaceId: string, memberId: string, userId: string) {
    // Check if user has permission to remove members
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        role: {
          in: ['owner', 'admin'],
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('Insufficient permissions to remove members');
    }

    return this.prisma.workspaceMember.delete({
      where: { id: memberId },
    });
  }

  async getMembers(workspaceId: string, userId: string) {
    // Check if user is a member of the workspace
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }
}
