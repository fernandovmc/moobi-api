import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
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
  async getCurrentUser(@Req() request: Request) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return { user: null };
    }
    const userData = await this.usersService.getCurrentUser(token);
    return { user: userData.user };
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  protectedRoute(@Req() request: Request) {
    return {
      message: 'Esta é uma rota protegida',
      user: request['user'],
    };
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
