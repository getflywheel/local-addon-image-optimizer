import 'jest-extended';

import fs from 'fs';
import path from 'path';


describe('Bundled binaries', () => {
	it('includes jpeg-recompress for supported os\'s', () => {
		const vendorDir = path.join(__dirname, '..', '..', 'vendor');

		expect(fs.existsSync(path.join(vendorDir, 'darwin', 'jpeg-recompress'))).toBeTrue();
		expect(fs.existsSync(path.join(vendorDir, 'linux', 'jpeg-recompress'))).toBeTrue();
		expect(fs.existsSync(path.join(vendorDir, 'win32', 'jpeg-recompress.exe'))).toBeTrue();
	});
});
