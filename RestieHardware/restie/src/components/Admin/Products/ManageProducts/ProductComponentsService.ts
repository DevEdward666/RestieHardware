export const base64toFile = (
    base64String: string,
    filename: string,
    mimeType: string
  ) => {
    try {
      // Remove data URI prefix if present
      const base64Data = base64String.replace(/^data:\w+\/\w+;base64,/, "");

      // Decode base64 string to binary data
      const binaryString = atob(base64Data);

      // Create ArrayBuffer directly from binary string
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      // Create Blob directly from ArrayBuffer
      const blob = new Blob([uint8Array], {
        type: mimeType,
      });

      // Create File object from Blob
      return new File([blob], filename, { type: mimeType });
    } catch (error) {
      console.error("Error converting base64 to File:", error);
      // Handle the error by returning null or throwing it
      throw error;
    }
  };

  export const productFilename = (filename:string,extension: string) => {
 
    return `${filename}.${extension}`;
  };

