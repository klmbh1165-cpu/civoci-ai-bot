const express=require("express");
const http=require("http");
const WebSocket=require("ws");
const path=require("path");
const app=express();
const server=http.createServer(app);
const wss=new WebSocket.Server({server,path:"/ws"});
app.use(express.static(path.join(__dirname)));
app.get("/api/health",(req,res)=>res.json({service:"CIVOCI AI Market Data Backend",status:"online",market:"BTCUSDT",source:"Binance public market stream"}));

wss.on("connection",client=>{
  const upstream=new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@kline_1m");
  upstream.on("message",raw=>{
    try{
      const d=JSON.parse(raw.toString());
      const k=d.k;
      const payload={type:"candle",data:{o:k.o,h:k.h,l:k.l,c:k.c,v:k.v,t:k.t,closed:k.x}};
      if(client.readyState===WebSocket.OPEN) client.send(JSON.stringify(payload));
    }catch(e){}
  });
  upstream.on("error",()=>{});
  client.on("close",()=>{try{upstream.close()}catch(e){}});
});
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log("CIVOCI backend running on "+PORT));
