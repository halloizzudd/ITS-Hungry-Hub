import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class FileUploadService {
  static editFileName(req, file, callback) {
    const fileExtName = extname(file.originalname); // Get file extension
    const fileName = `${uuidv4()}${fileExtName}`; // Generate unique file name
    callback(null, fileName);
  }
}
