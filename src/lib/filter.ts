/**
 * Aplica filtro preto e branco em uma lista de imagens
 * @param imageUrls - Array de URLs das imagens originais
 * @returns Promise que resolve com objeto contendo URLs e Files filtrados
 */
export const applyBlackWhiteFilter = async (
  imageUrls: string[]
): Promise<{
  filteredUrls: string[];
  filteredFiles: File[];
}> => {
  const filteredUrls: string[] = [];
  const filteredFiles: File[] = [];
  const canvasBW = document.createElement("canvas");
  const imgBW = document.createElement("img");
  const ctx = canvasBW.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) {
    throw new Error("Não foi possível criar contexto do canvas");
  }

  for (let imgIdx = 0; imgIdx < imageUrls.length; imgIdx++) {
    imgBW.src = imageUrls[imgIdx];
    
    // Aguardar o carregamento da imagem
    await new Promise((resolve) => {
      imgBW.onload = resolve;
    });
    
    canvasBW.width = imgBW.width;
    canvasBW.height = imgBW.height;
    ctx.drawImage(imgBW, 0, 0);
    
    const imgData = ctx.getImageData(0, 0, canvasBW.width, canvasBW.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
      let colour = 0;
      if (count > 510) colour = 255;
      else if (count > 255) colour = 127.5;

      imgData.data[i] = colour;
      imgData.data[i + 1] = colour;
      imgData.data[i + 2] = colour;
      imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const imgFiltered = canvasBW.toDataURL('image/png');
    filteredUrls.push(imgFiltered);
    
    // Converter canvas para Blob e depois para File
    await new Promise<void>((resolve) => {
      canvasBW.toBlob((blob) => {
        if (blob) {
          const filteredFile = new File([blob], `filtered_page_${imgIdx + 1}.png`, {
            type: 'image/png'
          });
          filteredFiles.push(filteredFile);
        }
        resolve();
      }, 'image/png');
    });
  }
  
  return { filteredUrls, filteredFiles };
};
