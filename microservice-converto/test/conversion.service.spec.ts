import { ConversionService } from '../src/app.service';

describe('ConversionService', () => {
  let service: ConversionService;

  beforeEach(() => {
    service = new ConversionService();
  });

  it('should convert DOCX to PDF', async () => {
    const result = await service.convertAndUpload({ fileName: 'TEST.docx' });
    console.log('PDF generated at:', result);
    expect(result).toContain('.pdf');
  });
});
