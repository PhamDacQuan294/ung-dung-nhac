const listTextareaMCE = document.querySelectorAll('[textarea-mce]');

if (listTextareaMCE.length > 0) {
  listTextareaMCE.forEach((textarea) => {
    const id = textarea.id;
    tinymce.init({
      selector: `#${id}`,
      plugins: "image code",
      license_key: 'gpl',
      image_title: true,
      images_upload_url: '/admin/upload',
      automatic_uploads: true,
      file_picker_types: "image",
    });
  });
}
