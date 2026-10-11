# NAGA CanSat Ground Station

# How to run
เปิด Terminal 
รัน python3 -m http.server 8000
เปิด Chrome ไปที่ http://localhost:8000

# How to connect to ESP

Firebase: ให้ ESP เขียน JSON ลง /naga/latest ไม่ต้องทำอะไรที่หน้าเว็บ
USB Serial: กดปุ่ม CONNECT SERIAL มุมขวาล่าง แล้วเลือกพอร์ต ถ้า baud ไม่ใช่ 9600 ให้เปิดด้วย http://localhost:8000/?baud=115200
WebSocket: เปิดด้วย http://localhost:8000/?ws=ws://192.168.x.x:81 โดยใส่ IP ของ ESP
