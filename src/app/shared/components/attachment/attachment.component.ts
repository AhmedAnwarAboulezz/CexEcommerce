import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { saveAs } from "file-saver";


@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent implements OnInit {

  fileType!: string;
  filesName: any[] = [];
  isDisabled!: boolean;
  uploadedFiles: any[] = [];
  selectedFiles: any[] = [];
  allowTypes: string[] = [];
  documentDetails!: {
    attachmentName?: string; attachmentExtension?: string;
    attachmentURL: string | ArrayBuffer | null; attachmentSize?: number | string;
    attachmentDisplaySize?: string | number;
  };
  imagesExtentions: string[] = ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'svg'];
  videosExtentions: string[] = ['mp4', 'mov', 'webm', 'mkv', 'flv', 'avi', 'wmv'];
  filesExtensions: any[] = ['pdf', 'powerpoint', 'word', 'doc', 'docx', 'ppt', 'pptx'];
  fileCondition!: { type: string; size: number; };

  @Input() fileConditions!: { type: string; size: number }[]; // [{ type: 'png', size: 2 }] ... you should put the size with MB
  @Input() editMode!: boolean;
  @Input() type!: string; // image OR video OR document OR imageDocument OR videoDocument OR imageVideo
  @Input() formGroup!: FormGroup;
  @Input() controlName!: string;
  @Input() maxFiles!: number;
  @Input() minWidth: number = 160;
  @Input() maxWidth: number = 2048;
  @Input() minHeight: number = 120;
  @Input() maxHeight: number = 1536;
  @Input() propertyName!: string;
  @Output() delete: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    this.setAllowedTypes();
  }

  ngAfterViewInit() {
    if (typeof this.formGroup.get(this.controlName)?.value !== 'object' && this.formGroup.get(this.controlName)?.value !== null
      && this.formGroup.get(this.controlName)?.value !== '' && this.editMode) {
      this.documentDetails = {
        attachmentName: this.formGroup.get('fileName') ? 
          this.formGroup.get('fileName')?.value ? this.formGroup.get('fileName')?.value : 
            this.formGroup.get('title')?.value ? this.formGroup.get('title')?.value : 
              `File Name.${this.getFileTypeFromBase64(this.formGroup.get(this.controlName)?.value)}` : 
                `File Name.${this.getFileTypeFromBase64(this.formGroup.get(this.controlName)?.value)}`,
        attachmentURL: this.formGroup.get(this.controlName)?.value,
        attachmentDisplaySize: this.getFileSizeFromBase64(this.formGroup.get(this.controlName)?.value),
        attachmentExtension: this.getFileTypeFromBase64(this.formGroup.get(this.controlName)?.value)
      };
      
      setTimeout(() => {
        this.selectedFiles.push(this.documentDetails);
        
        if (this.selectedFiles.length === this.maxFiles) {
          this.isDisabled = true;
        }
      });
    } else if(typeof this.formGroup.get(this.controlName)?.value === 'object' && this.formGroup.get(this.controlName)?.value !== null) {
      this.formGroup.get(this.controlName)?.value.map((attachment: any) => {
        this.documentDetails = {
          attachmentName: this.formGroup.get('fileName') ? 
            this.formGroup.get('fileName')?.value ? this.formGroup.get('fileName')?.value : 
              `File Name.${this.propertyName ? this.getFileTypeFromBase64(attachment[this.propertyName]) : this.getFileTypeFromBase64(attachment)}` : 
                `File Name.${this.propertyName ? this.getFileTypeFromBase64(attachment[this.propertyName]) : this.getFileTypeFromBase64(attachment)}`,
          attachmentURL: this.propertyName ? attachment[this.propertyName] : attachment,
          attachmentDisplaySize: this.propertyName ? this.getFileSizeFromBase64(attachment[this.propertyName]) : this.getFileSizeFromBase64(attachment),
          attachmentExtension: this.propertyName ? this.getFileTypeFromBase64(attachment[this.propertyName]) : this.getFileTypeFromBase64(attachment)
        };
        
        setTimeout(() => {
          this.selectedFiles.push(this.documentDetails);
          
          if (this.selectedFiles.length === this.maxFiles) {
            this.isDisabled = true;
          }
        });
      });
    }
  }

  setAllowedTypes() {
    if (this.type === 'image') {
      this.allowTypes = this.imagesExtentions;
    } else if (this.type === 'video') {
      this.allowTypes = this.videosExtentions;
    } else if (this.type === 'imageVideo') {
      this.allowTypes.concat(this.imagesExtentions, this.videosExtentions);
    } else if (this.type === 'imageDocument') {
      this.allowTypes.concat(this.imagesExtentions, this.filesExtensions);
    } else if (this.type === 'videoDocument') {
      this.allowTypes.concat(this.videosExtentions, this.filesExtensions);
    } else if (this.type === 'document') {
      this.allowTypes = this.filesExtensions;
    }
  }

  getAcceptTypes() {
    if (this.type === 'image') {
      return 'image/*';
    } else if (this.type === 'video') {
      return 'video/*';
    } else if (this.type === 'imageVideo') {
      return 'image/*, video/*';
    } else if (this.type === 'imageDocument') {
      return 'image/*, application/pdf, .doc, .docx, .ppt, .pptx';
    } else if (this.type === 'videoDocument') {
      return 'video/*, application/pdf, .doc, .docx, .ppt, .pptx';
    } else if (this.type === 'document') {
      return 'application/pdf, .doc, .docx, .ppt, .pptx';
    } else {
      return '*';
    }
  }

  uploadFiles(event: any, uploadType?: any) {
    // this.setError('');
    if (uploadType === 'drag') { // files uploaded by drag and drop
      this.uploadedFiles = event;
    } else if (uploadType === 'input') { // files uploaded by input type file
      for (let file of event.target.files) { // for multiple attribute
        if ((this.selectedFiles.length + event.target.files.length) <= this.maxFiles) {
          this.uploadedFiles.push(file);
        } else {
          this.setError('maxNum');
          event.target.value = '';
        }
      }
    }

    if ((this.selectedFiles.length + this.uploadedFiles.length) <= this.maxFiles) {
      for (let file of this.uploadedFiles) { // for drag and drop
        if (file.type.split('/').pop().toLowerCase() === 'svg+xml') {
          this.fileType = 'svg';
        } else if (!file.type) {
          if (file.name.split('.').pop().toLowerCase() === 'doc' || file.name.split('.').pop().toLowerCase() === 'docx') {
            this.fileType = 'word';
          } else if (file.name.split('.').pop().toLowerCase() === 'ppt' || file.name.split('.').pop().toLowerCase() === 'pptx') {
            this.fileType = 'powerpoint';
          }
        } else if (file.type.split('/').pop().toLowerCase() === 'vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type.split('/').pop().toLowerCase() === 'msword') {
          this.fileType = 'word';
        } else if (file.type.split('/').pop().toLowerCase() === 'vnd.openxmlformats-officedocument.presentationml.presentation' ||
          file.type.split('/').pop().toLowerCase() === 'vnd.ms-powerpoint') {
          this.fileType = 'powerpoint';
        } else if (file.type.split('/').pop().toLowerCase() === 'vnd.ms-excel') {
          this.fileType = 'csv';
        } else {
          this.fileType = file.type.split('/').pop().toLowerCase();
        }

        this.checkResolution(file);
        this.uploadedFiles = [];
        if (event.target) {
          event.target.value = '';
        }
      }
    } else {
      this.setError('maxNum');
      event.target.value = '';
    }
  }

  checkResolution(file: any) { //check resolution function
    if (this.allowTypes.includes(this.fileType) && !this.filesExtensions.includes(this.fileType)) {
      if (file.type === ('image/' + this.fileType) || file.type === 'image/svg+xml') {

        const img = new Image();
        img.src = window.URL.createObjectURL(file);

        img.onload = () => {
          let width = img.naturalWidth,
            height = img.naturalHeight;

          if ((width >= this.minWidth && height >= this.minHeight) && (width <= this.maxWidth && height <= this.maxHeight)) {
            // this.setError('');
            this.checkContions(file);
          } else {
            if (width < this.minWidth && height < this.minHeight) {
              this.setError('minResolution');
            } else if (width > this.maxWidth && height > this.maxHeight) {
              this.setError('maxResolution');
            }
          }
        };

      } else if (file.type === ('video/' + this.fileType)) { //if the file is video

        const video = document.createElement('video');
        video.src = window.URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          let width = video.videoWidth,
            height = video.videoHeight;

          if ((width >= this.minWidth && height >= this.minHeight) && (width <= this.maxWidth && height <= this.maxHeight)) {
            // this.setError('');
            this.checkContions(file);
          } else {
            this.setError('minResolution');
          }
        };
      }
    } else {
      this.checkContions(file);
    }
  }

  checkContions(file: any) {
    for (const fileCondition of this.fileConditions) {
      if (this.fileType === fileCondition.type) {  // check if type of selected file is the same as required type
        this.fileCondition = fileCondition;
        // this.setError('');

        if (file.size <= (fileCondition.size * 1024 * 1024)) { // chech if the size of the file minus or equal max size of file conditions
          if (this.filesName.includes(file.name)) {
            this.setError('fileSelected');
          } else {
            // this.setError('');

            let reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = () => {
              this.documentDetails = {
                attachmentName: file.name,
                attachmentURL: reader.result,
                attachmentExtension: this.fileType,
                attachmentSize: file.size
              };
            };

            reader.onloadend = () => {
              this.filesName.push(this.documentDetails.attachmentName);
              this.selectedFiles.push(this.documentDetails);
              
              if (this.maxFiles === 1) {
                this.formGroup.get(this.controlName)?.setValue(this.selectedFiles[0].attachmentURL);
              } else {
                this.formGroup.get(this.controlName)?.setValue(this.selectedFiles);
              }

              this.formGroup.get(this.controlName)?.markAsDirty();

              if (this.filesExtensions.includes(this.documentDetails.attachmentExtension)) {
                this.convertSize(+(this.documentDetails.attachmentSize as string));
              }

              if (this.selectedFiles.length === this.maxFiles) {
                this.isDisabled = true;
              }
            };
          }
        } else {
          this.setError('maxSize');
        }
      } else {
        if (!this.allowTypes.includes(this.fileType)) {
          this.setError('allowedTypes');
        }
      }
    }
  }

  getFileTypeFromBase64(base: string | ArrayBuffer) {
    let fileType = base.toString().split(';base64').shift() as string;

    if (fileType.split('/').pop()?.toLowerCase() === 'svg+xml') {
      return 'svg';
    } else if (fileType.split('/').pop()?.toLowerCase() === 'vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType.split('/').pop()?.toLowerCase() === 'msword') {
      return 'word';
    } else if (fileType.split('/').pop()?.toLowerCase() === 'vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileType.split('/').pop()?.toLowerCase() === 'vnd.ms-powerpoint') {
      return 'powerpoint';
    } else if (fileType.split('/').pop()?.toLowerCase() === 'vnd.ms-excel') {
      return 'csv';
    } else {
      return fileType.split('/').pop()?.toLowerCase();
    }
  }

  getFileSizeFromBase64(base: string | ArrayBuffer) {
    let base64 = base.toString().split('base64,').pop() as string;

    if(((Math.ceil(base64.length / 4) * 3 )) / 1000 > 1000) {
      return `${(((Math.ceil(base64.length / 4) * 3 )) / Math.pow(1024, 2)).toFixed(1).toString()}MB`;
    } else {
      return `${(((Math.ceil(base64.length / 4) * 3 )) / Math.pow(1024, 1)).toFixed().toString()}KB`;
    }
  }

  setError(errorName: string) {
    switch (errorName) {
      case 'maxNum':
        this.formGroup.get(this.controlName)?.setErrors({ maximumFiles: true });
        break;

      case 'minResolution':
        this.formGroup.get(this.controlName)?.setErrors({ minimumResolution: true });
        break;

      case 'maxResolution':
        this.formGroup.get(this.controlName)?.setErrors({ maximumResolution: true });
        break;

      case 'fileSelected':
        this.formGroup.get(this.controlName)?.setErrors({ fileSelected: true });
        break;

      case 'maxSize':
        this.formGroup.get(this.controlName)?.setErrors({ maximumSize: true });
        break;

      case 'allowedTypes':
        this.formGroup.get(this.controlName)?.setErrors({ allowedTypes: true });
        break;

      case 'required':
        this.formGroup.get(this.controlName)?.setErrors({ required: true });
        break;

      case '':
        this.formGroup.get(this.controlName)?.setErrors(null);
        break;

      default:
        break;
    }
  }

  remove(index: number) {
    this.isDisabled = false;
    this.filesName.length ? this.filesName.splice(index, 1) : ''; // delete file from filesName array which I use it to check in it about file name in the files in database

    if (typeof this.formGroup.get(this.controlName)?.value === 'string') {
      this.selectedFiles.splice(index, 1); // no need to remove the file from selectedFiles array because it removes automaticly when remove it from the form value
      this.formGroup.get(this.controlName)?.reset();
      this.formGroup.get(this.controlName)?.markAsDirty();
    } else {
      this.formGroup.get(this.controlName)?.value.splice(index, 1);
      this.selectedFiles.splice(index, 1);
      
      if (!this.formGroup.get(this.controlName)?.value.length) {
        this.formGroup.get(this.controlName)?.reset();
        this.formGroup.get(this.controlName)?.markAsDirty();
      }
    }
  }

  convertSize(totalSize: any) {
    if (!totalSize.toString().includes('.') && totalSize > 1) { // in case the size with bytes
      if (totalSize <= (1024 * 1024)) {
        this.documentDetails.attachmentDisplaySize = (totalSize / Math.pow(1024, 1)).toFixed() + ' KB';
      } else if (totalSize <= (1024 * 1024 * 1024)) {
        this.documentDetails.attachmentDisplaySize = (totalSize / Math.pow(1024, 2)).toFixed(1) + ' MB';
      }
    } else if (totalSize < 1) { // in case the size < 1 MB and the size returns from API - size returns with MB
      if ((totalSize * 1024) <= (1024 * 1024)) {
        this.documentDetails.attachmentDisplaySize = (totalSize * Math.pow(1024, 1)).toFixed() + ' KB';
      }
    } else { // in case the size > 1 MB and the size returns from API - size returns with MB
      this.documentDetails.attachmentDisplaySize = totalSize.toFixed(1) + ' MB';
    }
  }

  download(url: string) {
    saveAs(url, 'File Name' + "." + this.getFileTypeFromBase64(url));
  }
}
