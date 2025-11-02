import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

@ApiTags('Workspaces')
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({ status: 201, description: 'Workspace successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.create(createWorkspaceDto, req.user.id);
  }

  @Post('default')
  @ApiOperation({ summary: 'Create a default workspace with generated name' })
  @ApiResponse({ status: 201, description: 'Default workspace successfully created' })
  @ApiResponse({ status: 500, description: 'Failed to create default workspace' })
  createDefault(@Request() req: AuthenticatedRequest) {
    return this.workspacesService.createDefaultWorkspace(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user workspaces' })
  @ApiResponse({ status: 200, description: 'Workspaces retrieved successfully' })
  findAll(@Request() req: AuthenticatedRequest) {
    return this.workspacesService.findAll(req.user.id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get workspace by slug' })
  @ApiResponse({ status: 200, description: 'Workspace retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  findBySlug(@Param('slug') slug: string, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.findBySlug(slug, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  @ApiResponse({ status: 200, description: 'Workspace retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace' })
  @ApiResponse({ status: 200, description: 'Workspace updated successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  update(@Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.update(id, updateWorkspaceDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workspace' })
  @ApiResponse({ status: 200, description: 'Workspace deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 403, description: 'Only workspace owner can delete' })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.remove(id, req.user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get workspace members' })
  @ApiResponse({ status: 200, description: 'Workspace members retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Not a member of this workspace' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  getMembers(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.getMembers(id, req.user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to workspace' })
  @ApiResponse({ status: 201, description: 'Member successfully added' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  addMember(@Param('id') id: string, @Body() addMemberDto: AddMemberDto, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.addMember(id, addMemberDto, req.user.id);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove member from workspace' })
  @ApiResponse({ status: 200, description: 'Member successfully removed' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  removeMember(@Param('id') workspaceId: string, @Param('memberId') memberId: string, @Request() req: AuthenticatedRequest) {
    return this.workspacesService.removeMember(workspaceId, memberId, req.user.id);
  }
}
