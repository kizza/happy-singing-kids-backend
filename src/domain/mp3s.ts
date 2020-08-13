type ProductId = string;
type BucketKey = string;

const files: Record<ProductId, BucketKey> = {
  // mps3
  prod_HOdRq4x692ERsA: "Grumplestiltskin.mp3",
  prod_HRh1JWoeQ6Etnj: "Bummer mummy.mp3",
  prod_HRgyCTMF0a5tUo: "Butterfly flaps its wings.mp3",
  prod_HOdRUkZgB5CFmH: "Uh oh spaghetti oh.mp3",
  prod_HmVUV2SprbAo9h: "Lullaby Angel.mp3",
  prod_HmVVaM78OF7B35: "The Wind.mp3",
  prod_HmVVnVWod9t63R: "Go to bed.mp3",
  prod_HmVWh5V6yJyCBE: "Greetings song.mp3",
  // Zips
  prod_HmVWh5V6yJyCAG: "Happy Singing Kids.zip",
};

const getFile = (productId: ProductId) =>
  files[productId] || `Unknown ${productId}`;

export const getFilename = getFile;

export const getFiletype = (productId: ProductId) =>
  getFile(productId).indexOf(".mp3") >= 0 ? "audio" : "download";
