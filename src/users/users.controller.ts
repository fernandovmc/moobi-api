import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthRequest } from './interfaces/auth-request.interface';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.usersService.register(registerDto);
    return {
      user: result.data.user,
      session: result.data.session,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.usersService.login(loginDto);
    return {
      user: result.data.user,
      session: result.data.session,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return this.usersService.logout();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@Req() request: AuthRequest) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return { user: null };
    }
    const userData = await this.usersService.getCurrentUser(token);
    return userData;
  }

  // Novos endpoints para gerenciamento de usuários

  @Get('users')
  @UseGuards(AuthGuard)
  async getAllUsers() {
    return { users: await this.usersService.getAllUsers() };
  }

  @Get('users/:id')
  @UseGuards(AuthGuard)
  async getUserById(@Param('id') id: string) {
    return { user: await this.usersService.getUserById(id) };
  }

  @Put('users/:id')
  @UseGuards(AuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return {
      user: await this.usersService.updateUser(id, updateUserDto),
      message: 'User updated successfully',
    };
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  protectedRoute(@Req() request: AuthRequest) {
    return {
      message: 'Esta é uma rota protegida',
      user: request.user,
    };
  }

  private extractTokenFromHeader(request: AuthRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
