import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { decodeJwtPayload, JwtPayload } from '@psyapp/core';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          if (req?.cookies?.access_token) {
            return req.cookies.access_token;
          }
          return null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET || 'default-access-secret-change-me',
      issuer: process.env.TOKEN_ISSUER || 'psyapp-saas',
      audience: process.env.TOKEN_AUDIENCE || 'psyapp-saas-api',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.role) {
      throw new UnauthorizedException();
    }
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
