import { Controller, Request, Post, UseGuards, Body, HttpCode } from "@nestjs/common"
import { LocalAuthGuard } from "./local-auth.guard"
import { AuthService } from "./auth.service"
import { UserService } from "../user/user.service"
import { EmailService } from "../shared/email.service"
import { CreateUserDto } from "../user/createUser.dto"
import { DefaultAuthGuard } from "./default.guard"
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger"
import { LoginDto, LoginResponseDto } from "./login.dto"

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private emailService: EmailService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: "Login", operationId: "login" })
  login(@Request() req): LoginResponseDto {
    const accessToken = this.authService.generateAccessToken(req.user)
    return { accessToken }
  }

  @UseGuards(DefaultAuthGuard)
  @Post("token")
  @ApiOperation({ summary: "Token", operationId: "token" })
  token(@Request() req) {
    const accessToken = this.authService.generateAccessToken(req.user)
    return { accessToken }
  }
}
