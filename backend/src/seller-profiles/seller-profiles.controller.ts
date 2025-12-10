import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Patch,
  Param,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Use passport auth guard for JWT
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator'; // Ensure the decorator path is correct
import { SellerProfilesService } from './seller-profiles.service';
import { CreateSellerProfileDto } from './dto/create-seller-profile.dto'; // Ensure the DTO path is correct
import { FileFieldsInterceptor } from '@nestjs/platform-express'; // Ensure multer is installed
// Use string role names since Prisma schema stores role as string
import { diskStorage } from 'multer'; // Ensure multer is installed
import { FileUploadService } from 'src/utils/file-upload.service'; // Use file upload service helper

// Create a JwtAuthGuard class by calling AuthGuard('jwt') to keep typing safe
const JwtAuthGuard = AuthGuard('jwt');

@Controller('seller-profiles')
export class SellerProfilesController {
  constructor(private readonly sellerProfilesService: SellerProfilesService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photoKtp', maxCount: 1 },
        { name: 'photoStall', maxCount: 1 },
        { name: 'qrisImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads', // Store files in the uploads folder
          filename: (req, file, callback) =>
            FileUploadService.editFileName(req, file, callback), // Function to rename files
        }),
      },
    ),
  )
  async create(
    @Body() dto: CreateSellerProfileDto, // Capture seller profile data from request body
    @UploadedFiles()
    files: {
      photoKtp: Express.Multer.File[];
      photoStall: Express.Multer.File[];
      qrisImage: Express.Multer.File[];
    }, // Capture uploaded files
    @Request() req: { user: { id: number; email: string; role: string } }, // Request contains user info (from JWT)
  ) {
    return this.sellerProfilesService.create(req.user, dto, files); // Service method for profile creation
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async verify(
    @Param('id') id: number, // Get seller profile ID from URL
    @Body() body: { status: string; reason?: string }, // Get verification status and optional reason from request body
  ) {
    return this.sellerProfilesService.verifySeller(
      id,
      body.status,
      body.reason,
    ); // Service method for verification
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll(@Query('status') status?: string) {
    return this.sellerProfilesService.findAll(status);
  }
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  async getStats(@Request() req) {
    return this.sellerProfilesService.getStats(req.user.id);
  }
}
