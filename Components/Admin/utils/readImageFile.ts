export function readImageFile(file: File) {
  return new Promise<{ base64: string; name: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ base64: String(reader.result || ""), name: file.name });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
