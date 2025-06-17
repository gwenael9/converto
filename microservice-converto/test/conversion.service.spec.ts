import { AppService } from '../src/app.service';

describe('ConversionService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should convert DOCX to PDF', async () => {
    const result = await service.convertAndUpload({ fileName: 'TEST.docx' });
    console.log('PDF generated at:', result);
    expect(result).toContain('.pdf');
  });
});
