import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { SupabaseService } from '../supabase/supabase.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private supabase: SupabaseService,
    private jwt: JwtService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: { email: string; password: string; name: string },
  ) {
    return this.auth.register(body.email, body.password, body.name);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: any) {
    return req.user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @Get('test-public')
  @HttpCode(HttpStatus.OK)
  async testPublic() {
    return { message: 'Public endpoint works!' };
  }

  @Get('test-guard')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async testGuard(@Request() req: any) {
    return { message: 'Guard works!', user: req.user };
  }

  @Post('test-login')
  @HttpCode(HttpStatus.OK)
  async testLogin() {
    const testCompanyId = 'default-test-company-id';
    const token = this.jwt.sign({
      sub: 'test-user-123',
      email: 'kairolopes@gmail.com',
      role: 'USER',
      companyId: testCompanyId,
    });
    return {
      token,
      access_token: token,
      user: {
        id: 'test-user-123',
        email: 'kairolopes@gmail.com',
        name: 'Kairo Lopes',
        role: 'USER',
        companyId: testCompanyId,
      },
    };
  }

  private checkMasterAdmin(email: string) {
    if (email !== 'kairolopes@gmail.com') {
      throw new ForbiddenException('Only kairolopes@gmail.com can perform this action');
    }
  }

  @Post('admin/company')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCompany(@Request() req: any, @Body() body: { name: string }) {
    this.checkMasterAdmin(req.user.email);
    const supabase = this.supabase.getClient();

    const { data, error } = await supabase
      .from('companies')
      .insert({ name: body.name })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { company: data, message: 'Company created successfully' };
  }

  @Post('admin/company/:companyId/user')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCompanyUser(
    @Request() req: any,
    @Body() body: { email: string; name: string; companyId: string }
  ) {
    this.checkMasterAdmin(req.user.email);
    const supabaseAdmin = this.supabase.getAdminClient();
    const supabase = this.supabase.getClient();

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: Math.random().toString(36).slice(-12),
      email_confirm: true,
      user_metadata: { name: body.name },
    });

    if (userError) throw new BadRequestException(userError.message);

    const { data: linkData, error: linkError } = await supabase
      .from('user_companies')
      .insert({
        user_id: userData.user.id,
        company_id: body.companyId,
        role: 'user',
      })
      .select()
      .single();

    if (linkError) throw new BadRequestException(linkError.message);

    return {
      user: { id: userData.user.id, email: userData.user.email, name: body.name },
      company_id: body.companyId,
      message: 'User created and linked to company. User can reset password via email.',
    };
  }

  @Get('admin/companies')
  @UseGuards(JwtAuthGuard)
  async getCompanies(@Request() req: any) {
    this.checkMasterAdmin(req.user.email);
    const supabase = this.supabase.getClient();

    const { data, error } = await supabase.from('companies').select('*');
    if (error) throw new BadRequestException(error.message);
    return { companies: data };
  }

  @Get('admin/company/:companyId/users')
  @UseGuards(JwtAuthGuard)
  async getCompanyUsers(@Request() req: any, @Param('companyId') companyId: string) {
    this.checkMasterAdmin(req.user.email);
    const supabase = this.supabase.getClient();

    const { data, error } = await supabase
      .from('user_companies')
      .select('*')
      .eq('company_id', companyId);

    if (error) throw new BadRequestException(error.message);
    return { users: data };
  }
}
