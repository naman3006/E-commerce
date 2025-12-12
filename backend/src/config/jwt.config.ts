import { JwtModuleOptions } from '@nestjs/jwt';
import { StringValue } from 'ms'; // Add this import for the branded type

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET || 'secretkey123',
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as StringValue, // Cast to match type
  },
};
