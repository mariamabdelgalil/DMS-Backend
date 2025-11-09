import app from "./app";
import { connectMongo } from "./config/mongo";

const PORT = process.env.PORT || 3000;
connectMongo();

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
