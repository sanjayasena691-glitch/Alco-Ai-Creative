export const downloadText = (filename: string, text: string) => {
  const element = document.createElement('a');
  const file = new Blob([text], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
};

export const downloadImage = (filename: string, base64Data: string) => {
  const element = document.createElement('a');
  element.href = base64Data;
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
