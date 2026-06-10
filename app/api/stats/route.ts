export const runtime = "nodejs";
import si from "systeminformation";

export async function GET() {
  const cpu = await si.currentLoad();
  const mem = await si.mem();
  const temp = await si.cpuTemperature();

  return Response.json({
    cpu: cpu.currentLoad,
    ram: (mem.used / mem.total) * 100,
    temp: temp.main,
  });
}

