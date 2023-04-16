import { v1 } from "https://deno.land/std/uuid/mod.ts";
import { serve } from "https://deno.land/std/http/mod.ts";

const clients = [];

const ws_handler = (req: Request) => {
  const { socket, response } = Deno.upgradeWebSocket(req);
  clients.push(socket);

  socket.onopen = () => {
    socket.send(JSON.stringify("connected to server"));
  };

  socket.onclose = () => {
    console.log("on close");
  };

  socket.onmessage = (m) => {
    clients.forEach((client) => {
      if (client) {
        client.send(m.data);
      }
    });
  };

  return response;
};

serve(ws_handler);
