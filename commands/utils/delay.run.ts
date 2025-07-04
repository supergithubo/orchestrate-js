import logger from "../../services/logger.service";

export default async function run({
  id,
  params,
}: {
  id: string;
  params: { seconds: number };
}): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, params.seconds * 1000));
  logger.log("info", "util", id);

  return;
}
