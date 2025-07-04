import logger from "../../services/logger.service";

export default async function run({
  id,
  params,
}: {
  id: string;
  params: { callback: Function };
}): Promise<any> {
  return await params.callback();
}
