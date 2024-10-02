const rcedit = require('rcedit');
const path = require('path');

async function addIcon() {
  const exePath = path.join(__dirname, '..', 'dist', 'dywo.exe');
  const iconPath = path.join(__dirname, '..', 'assets', 'dywo-icon.ico');

  try {
    await rcedit(exePath, {
      icon: iconPath,
      'version-string': {
        ProductName: 'Dywo',
        FileDescription: 'Dywo CLI Tool',
        CompanyName: 'Bluethefox',
        LegalCopyright: '© 2023 Bluethefox',
        OriginalFilename: 'dywo.exe',
        FileVersion: '1.0.0',
        ProductVersion: '1.0.0',
      },
    });
    console.log('Icon and metadata added successfully!');
  } catch (error) {
    console.error('Failed to add icon:', error);
  }
}

addIcon();