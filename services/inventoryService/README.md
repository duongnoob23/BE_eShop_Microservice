Augment

API của Inventory Service
Dưới đây là danh sách các API của Inventory Service, bao gồm URI, chức năng, input và output:

1. Lấy tất cả inventory
   URI: GET /api/inventory
   Chức năng: Lấy danh sách tất cả các bản ghi inventory
   Input: Không có

[
{
"_id": "65f1a1f7c1b5cb2c3c2a1b1a",
"productId": "65f1a1f7c1b5cb2c3c2a1b1a",
"availableQuantity": 50,
"reservedQuantity": 0,
"lastUpdated": "2023-05-18T10:30:00.000Z"
},
{
"_id": "65f1a1f7c1b5cb2c3c2a1b1b",
"productId": "65f1a1f7c1b5cb2c3c2a1b1b",
"availableQuantity": 30,
"reservedQuantity": 0,
"lastUpdated": "2023-05-18T10:30:00.000Z"
}
// ...
]

2. Lấy inventory theo productId
   URI: GET /api/inventory/:productId
   Chức năng: Lấy thông tin inventory của một sản phẩm cụ thể
   Input: productId trong URL
   Output:
   {
   "\_id": "65f1a1f7c1b5cb2c3c2a1b1a",
   "productId": "65f1a1f7c1b5cb2c3c2a1b1a",
   "availableQuantity": 50,
   "reservedQuantity": 0,
   "lastUpdated": "2023-05-18T10:30:00.000Z"
   }

3. Tạo mới inventory
   URI: POST /api/inventory
   Chức năng: Tạo một bản ghi inventory mới cho sản phẩm
   Input:
   Input
   {
   "productId": "65f1a1f7c1b5cb2c3c2a1b1a",
   "availableQuantity": 50,
   "reservedQuantity": 0
   }
   Output:
   {
   "\_id": "65f1a1f7c1b5cb2c3c2a1b1a",
   "productId": "65f1a1f7c1b5cb2c3c2a1b1a",
   "availableQuantity": 50,
   "reservedQuantity": 0,
   }

4. Cập nhật inventory
   URI: PUT /api/inventory/:productId
   Chức năng: Cập nhật thông tin inventory của một sản phẩm
   Input:
   {
   "availableQuantity": 50,
   "reservedQuantity": 0
   }
   Output:
   {
   "\_id": "65f1a1f7c1b5cb2c3c2a1b1a",
   "productId": "65f1a1f7c1b5cb2c3c2a1b1a",
   "availableQuantity": 50,
   "reservedQuantity": 0,
   "lastUpdated": "2023-05-18T10:30:00.000Z"
   }

5. Xóa inventory
   URI: DELETE /api/inventory/:productId
   Chức năng: Xóa một bản ghi inventory của một sản phẩm
   Input: productId trong URL
   Output: Không có

6. Đặt hàng
   URI: POST /api/inventory/:productId/reserve
   Chức năng: Đặt hàng một số lượng sản phẩm
   Input:
   {
   "quantity": 10
   }
   Output:
   {
   "\_id": "65f1a1f7c1b5cb2c3c2a1b1a",
   "productId": "65f1a1f7c1b5cb2c3c2a1b1a",
   "availableQuantity": 40,
   "reservedQuantity": 10,
   "lastUpdated": "2023-05-18T10:30:00.000Z"
   }

7. Hủy đặt hàng
   URI: POST /api/inventory/:productId/release
   Chức năng: Hủy đặt hàng một số lượng sản phẩm
   Input:
   {
   "quantity": 10
   }
   Output:
   {
   "\_id": "65f1a1f7c1b5cb2c3c2a1b1a",
   "productId": "65f1a1f7c1b5cb2c3c2a1b1a",
   "availableQuantity": 50,
   "reservedQuantity": 0,
   "lastUpdated": "2023-05-18T10:30:00.000Z"
   }

8. Cập nhật số lượng tồn kho
   URI: PUT /api/inventory/:productId/quantity
   Chức năng: Cập nhật số lượng tồn kho của một sản phẩm
   Input:
   {
   "quantity": 100,
   "operation": "SET" // hoặc "ADD", "SUBTRACT"
   }
   Output:
   {
   "\_id": "65f1a1f7c1b5cb2c3c2a1b1a",
   "productId": "65f1a1f7c1b5cb2c3c2a1b1a",
   "availableQuantity": 100,
   "reservedQuantity": 0,
   "lastUpdated": "2023-05-18T10:30:00.000Z"
   }

   Khi sử dụng operation "SET":
   Cập nhật tổng số lượng trong kho (availableQuantity + reservedQuantity)
   Giữ nguyên reservedQuantity
   Tính toán lại availableQuantity = tổng số lượng - reservedQuantity
   Khi sử dụng operation "ADD" hoặc "SUBTRACT":
   Chỉ thay đổi availableQuantity, không ảnh hưởng đến reservedQuantity

Method URI Chức năng
GET /api/inventory Lấy tất cả inventory
GET /api/inventory/:productId Lấy inventory theo productId
POST /api/inventory Tạo inventory mới
PUT /api/inventory/:productId Cập nhật inventory
POST /api/inventory/:productId/reserve Đặt trước inventory
POST /api/inventory/:productId/release Giải phóng inventory đã đặt trước
DELETE /api/inventory/:productId Xóa inventory

![alt text](image.png)

lệnh chạy kafka

2. Cấu hình Kafka
   Mở file config/server.properties trong thư mục Kafka
   Đảm bảo các cấu hình sau:

broker.id=0
listeners=PLAINTEXT://localhost:9092
log.dirs=/tmp/kafka-logs
zookeeper.connect=localhost:2181

3. Khởi động ZooKeeper
   Mở terminal/command prompt và chạy:

# Windows (không cần Run as Admin)

bin\windows\zookeeper-server-start.bat config\zookeeper.properties

# Linux/Mac

bin/zookeeper-server-start.sh config/zookeeper.properties

4. Khởi động Kafka Server
   Mở terminal/command prompt khác và chạy:

# Windows (không cần Run as Admin)

bin\windows\kafka-server-start.bat config\server.properties

# Linux/Mac

bin/kafka-server-start.sh config/server.properties

Lưu ý:

Bạn chỉ cần khởi động ZooKeeper và Kafka Server một lần duy nhất sau khi cài đặt
Các service sẽ kết nối đến Kafka đang chạy này
Mỗi khi khởi động lại máy tính, bạn cần khởi động lại ZooKeeper và Kafka Server

5. Tạo các topics cần thiết
   Mặc dù bạn đã định nghĩa các topics trong code, nhưng Kafka cần biết về các topics này trước khi chúng được sử dụng. Bạn có hai lựa chọn:

# Windows

bin\windows\kafka-topics.bat --create --topic ProductUpdated --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic InventoryUpdated --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic CheckInventory --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic InventoryChecked --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic InventoryNotAvailable --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic OrderCreated --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
bin\windows\kafka-topics.bat --create --topic OrderCancelled --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

Khởi động ZooKeeper và Kafka
Mở Command Prompt (CMD)
Chuyển đến thư mục Kafka:

D:
cd D:\Kafka\kafka_2.13-3.4.0

Khởi động ZooKeeper:

bin\windows\zookeeper-server-start.bat config\zookeeper.properties

Mở một cửa sổ Command Prompt mới
Chuyển đến thư mục Kafka trong cửa sổ mới:

D:
cd D:\Kafka\kafka_2.13-3.4.0

Khởi động Kafka Server:

bin\windows\kafka-server-start.bat config\server.properties

Lưu ý quan trọng
Bạn cần giữ cả hai cửa sổ Command Prompt mở để ZooKeeper và Kafka Server tiếp tục chạy
Nếu bạn đóng các cửa sổ này, các dịch vụ sẽ dừng lại
Mỗi khi khởi động lại máy tính, bạn cần thực hiện lại các bước trên
Kiểm tra Kafka đã chạy thành công
Để kiểm tra Kafka đã chạy thành công, bạn có thể mở một cửa sổ Command Prompt thứ ba và thực hiện:

D:
cd D:\Kafka\kafka_2.13-3.4.0
bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092

Nếu Kafka đang chạy, lệnh này sẽ hiển thị danh sách các topics (có thể trống nếu bạn chưa tạo topics nào).

Cú pháp chung để quản lý Kafka topics trên Windows là:

bin\windows\kafka-topics.bat [COMMAND] [OPTIONS]
[COMMAND] là hành động bạn muốn thực hiện (tạo, liệt kê, xóa, mô tả, v.v.)
[OPTIONS] là các tùy chọn cho hành động đó

1. Tạo topic mới
   bin\windows\kafka-topics.bat --create --topic TÊN_TOPIC --bootstrap-server localhost:9092 --partitions SỐ_PARTITION --replication-factor HỆ_SỐ_NHÂN_BẢN

Trong đó:
--create: Hành động tạo topic mới
--topic: Tên của topic muốn tạo
--bootstrap-server: Địa chỉ của Kafka broker
--partitions: Số lượng partition (phân vùng) cho topic
--replication-factor: Hệ số nhân bản (thường là 1 cho môi trường phát triển)

bin\windows\kafka-topics.bat --create --topic OrderCreated --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

2. Liệt kê tất cả các topics
   bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092

3. Mô tả chi tiết về một topic
   bin\windows\kafka-topics.bat --describe --topic TÊN_TOPIC --bootstrap-server localhost:9092

4. Xóa một topic
   bin\windows\kafka-topics.bat --delete --topic TÊN_TOPIC --bootstrap-server localhost:9092

5. Thay đổi cấu hình của một topic
   bin\windows\kafka-topics.bat --alter --topic TÊN_TOPIC --bootstrap-server localhost:9092 --partitions SỐ_PARTITION_MỚI
