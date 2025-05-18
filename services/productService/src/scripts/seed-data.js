const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/product");
const Category = require("../models/category");

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/productdb";

// Sample categories - Danh mục chính
const categories = [
  {
    name: "Điện tử",
    description: "Các thiết bị điện tử và công nghệ",
  },
  {
    name: "Thời trang",
    description: "Quần áo và phụ kiện thời trang",
  },
  {
    name: "Nhà cửa & Đời sống",
    description: "Đồ dùng gia đình và nội thất",
  },
  {
    name: "Sức khỏe & Làm đẹp",
    description: "Sản phẩm chăm sóc sức khỏe và làm đẹp",
  },
  {
    name: "Thể thao & Du lịch",
    description: "Dụng cụ thể thao và đồ dùng du lịch",
  },
  {
    name: "Sách & Văn phòng phẩm",
    description: "Sách và các sản phẩm văn phòng",
  },
  {
    name: "Đồ chơi & Mẹ và bé",
    description: "Đồ chơi và sản phẩm dành cho trẻ em",
  },
  {
    name: "Thực phẩm & Đồ uống",
    description: "Thực phẩm và đồ uống các loại",
  },
];

// Sample subcategories - Danh mục con
const subcategories = [
  // Điện tử
  {
    name: "Điện thoại & Máy tính bảng",
    description: "Điện thoại di động, máy tính bảng và phụ kiện",
    parentCategory: "Điện tử",
  },
  {
    name: "Laptop & Máy tính",
    description: "Máy tính xách tay, máy tính để bàn và linh kiện",
    parentCategory: "Điện tử",
  },
  {
    name: "Thiết bị âm thanh",
    description: "Tai nghe, loa và thiết bị âm thanh",
    parentCategory: "Điện tử",
  },
  {
    name: "Máy ảnh & Quay phim",
    description: "Máy ảnh, máy quay phim và phụ kiện",
    parentCategory: "Điện tử",
  },

  // Thời trang
  {
    name: "Thời trang nam",
    description: "Quần áo và phụ kiện cho nam",
    parentCategory: "Thời trang",
  },
  {
    name: "Thời trang nữ",
    description: "Quần áo và phụ kiện cho nữ",
    parentCategory: "Thời trang",
  },
  {
    name: "Đồng hồ & Trang sức",
    description: "Đồng hồ và trang sức thời trang",
    parentCategory: "Thời trang",
  },
  {
    name: "Giày dép",
    description: "Giày dép cho nam và nữ",
    parentCategory: "Thời trang",
  },

  // Nhà cửa & Đời sống
  {
    name: "Đồ nội thất",
    description: "Bàn ghế, tủ và các đồ nội thất khác",
    parentCategory: "Nhà cửa & Đời sống",
  },
  {
    name: "Đồ dùng nhà bếp",
    description: "Dụng cụ nấu ăn và đồ dùng nhà bếp",
    parentCategory: "Nhà cửa & Đời sống",
  },
  {
    name: "Đồ dùng phòng ngủ",
    description: "Chăn ga gối đệm và đồ dùng phòng ngủ",
    parentCategory: "Nhà cửa & Đời sống",
  },

  // Sức khỏe & Làm đẹp
  {
    name: "Mỹ phẩm",
    description: "Sản phẩm trang điểm và chăm sóc da",
    parentCategory: "Sức khỏe & Làm đẹp",
  },
  {
    name: "Chăm sóc cá nhân",
    description: "Sản phẩm chăm sóc cá nhân",
    parentCategory: "Sức khỏe & Làm đẹp",
  },
  {
    name: "Thực phẩm chức năng",
    description: "Vitamin và thực phẩm bổ sung",
    parentCategory: "Sức khỏe & Làm đẹp",
  },

  // Thể thao & Du lịch
  {
    name: "Dụng cụ thể thao",
    description: "Dụng cụ tập luyện và thi đấu",
    parentCategory: "Thể thao & Du lịch",
  },
  {
    name: "Trang phục thể thao",
    description: "Quần áo và giày dép thể thao",
    parentCategory: "Thể thao & Du lịch",
  },
  {
    name: "Đồ dùng du lịch",
    description: "Vali, balo và phụ kiện du lịch",
    parentCategory: "Thể thao & Du lịch",
  },

  // Sách & Văn phòng phẩm
  {
    name: "Sách tiếng Việt",
    description: "Sách tiếng Việt các thể loại",
    parentCategory: "Sách & Văn phòng phẩm",
  },
  {
    name: "Sách ngoại văn",
    description: "Sách tiếng Anh và các ngôn ngữ khác",
    parentCategory: "Sách & Văn phòng phẩm",
  },
  {
    name: "Văn phòng phẩm",
    description: "Bút, vở và dụng cụ văn phòng",
    parentCategory: "Sách & Văn phòng phẩm",
  },

  // Đồ chơi & Mẹ và bé
  {
    name: "Đồ chơi",
    description: "Đồ chơi cho trẻ em các lứa tuổi",
    parentCategory: "Đồ chơi & Mẹ và bé",
  },
  {
    name: "Sản phẩm cho mẹ",
    description: "Sản phẩm dành cho mẹ bầu và sau sinh",
    parentCategory: "Đồ chơi & Mẹ và bé",
  },
  {
    name: "Sản phẩm cho bé",
    description: "Sản phẩm chăm sóc và nuôi dưỡng trẻ",
    parentCategory: "Đồ chơi & Mẹ và bé",
  },

  // Thực phẩm & Đồ uống
  {
    name: "Thực phẩm tươi sống",
    description: "Rau củ, trái cây, thịt và hải sản tươi",
    parentCategory: "Thực phẩm & Đồ uống",
  },
  {
    name: "Thực phẩm khô",
    description: "Gạo, mì, ngũ cốc và các loại thực phẩm khô",
    parentCategory: "Thực phẩm & Đồ uống",
  },
  {
    name: "Đồ uống",
    description: "Nước giải khát, cà phê, trà và các loại đồ uống",
    parentCategory: "Thực phẩm & Đồ uống",
  },
];

// Generate sample products
const generateProducts = (categories, subcategories) => {
  const products = [];

  // Find subcategory by name
  const findSubcategory = (name) => {
    return subcategories.find((c) => c.name === name);
  };

  // Điện thoại & Máy tính bảng
  const phoneCategory = findSubcategory("Điện thoại & Máy tính bảng");
  products.push(
    {
      name: "iPhone 14 Pro Max",
      description:
        "Điện thoại iPhone 14 Pro Max 256GB, màn hình Super Retina XDR 6.7 inch, chip A16 Bionic",
      price: 28990000,
      images: [
        "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=1480&auto=format&fit=crop",
      ],
      categoryId: phoneCategory._id,
      stock: 50,
    },
    {
      name: "Samsung Galaxy S23 Ultra",
      description:
        "Điện thoại Samsung Galaxy S23 Ultra 256GB, màn hình Dynamic AMOLED 2X 6.8 inch, chip Snapdragon 8 Gen 2",
      price: 23990000,
      images: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1527&auto=format&fit=crop",
      ],
      categoryId: phoneCategory._id,
      stock: 45,
    },
    {
      name: "iPad Air 5",
      description:
        "Máy tính bảng iPad Air 5 WiFi 64GB, màn hình Liquid Retina 10.9 inch, chip M1",
      price: 15990000,
      images: [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1471&auto=format&fit=crop",
      ],
      categoryId: phoneCategory._id,
      stock: 30,
    },
    {
      name: "Xiaomi Redmi Note 12 Pro",
      description:
        "Điện thoại Xiaomi Redmi Note 12 Pro 128GB, màn hình AMOLED 6.67 inch, chip MediaTek Dimensity 1080",
      price: 7490000,
      images: [
        "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=1480&auto=format&fit=crop",
      ],
      categoryId: phoneCategory._id,
      stock: 60,
    }
  );

  // Laptop & Máy tính
  const laptopCategory = findSubcategory("Laptop & Máy tính");
  products.push(
    {
      name: "MacBook Air M2",
      description:
        "Laptop MacBook Air M2 2023, màn hình Liquid Retina 13.6 inch, 8GB RAM, 256GB SSD",
      price: 26990000,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1452&auto=format&fit=crop",
      ],
      categoryId: laptopCategory._id,
      stock: 25,
    },
    {
      name: "Dell XPS 13 Plus",
      description:
        "Laptop Dell XPS 13 Plus, màn hình 13.4 inch 4K, Intel Core i7-1260P, 16GB RAM, 512GB SSD",
      price: 39990000,
      images: [
        "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=1632&auto=format&fit=crop",
      ],
      categoryId: laptopCategory._id,
      stock: 15,
    },
    {
      name: "Asus ROG Strix G15",
      description:
        "Laptop gaming Asus ROG Strix G15, màn hình 15.6 inch 144Hz, AMD Ryzen 7, 16GB RAM, 512GB SSD, RTX 3060",
      price: 29990000,
      images: [
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1468&auto=format&fit=crop",
      ],
      categoryId: laptopCategory._id,
      stock: 20,
    }
  );

  // Thiết bị âm thanh
  const audioCategory = findSubcategory("Thiết bị âm thanh");
  products.push(
    {
      name: "Apple AirPods Pro 2",
      description:
        "Tai nghe không dây Apple AirPods Pro 2 với công nghệ chống ồn chủ động, âm thanh không gian",
      price: 5990000,
      images: [
        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: audioCategory._id,
      stock: 40,
    },
    {
      name: "Sony WH-1000XM5",
      description:
        "Tai nghe chụp tai Sony WH-1000XM5 với công nghệ chống ồn hàng đầu, âm thanh Hi-Res",
      price: 8490000,
      images: [
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1465&auto=format&fit=crop",
      ],
      categoryId: audioCategory._id,
      stock: 30,
    },
    {
      name: "JBL Flip 6",
      description:
        "Loa bluetooth JBL Flip 6 chống nước, pin 12 giờ, âm thanh mạnh mẽ",
      price: 2490000,
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1631&auto=format&fit=crop",
      ],
      categoryId: audioCategory._id,
      stock: 50,
    }
  );

  // Thời trang nam
  const menFashionCategory = findSubcategory("Thời trang nam");
  products.push(
    {
      name: "Áo sơ mi nam dài tay",
      description:
        "Áo sơ mi nam dài tay chất liệu cotton cao cấp, kiểu dáng thanh lịch",
      price: 399000,
      images: [
        "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?q=80&w=1525&auto=format&fit=crop",
      ],
      categoryId: menFashionCategory._id,
      stock: 100,
    },
    {
      name: "Quần jeans nam slim fit",
      description:
        "Quần jeans nam slim fit co giãn, màu xanh đậm, phong cách trẻ trung",
      price: 599000,
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1626&auto=format&fit=crop",
      ],
      categoryId: menFashionCategory._id,
      stock: 80,
    },
    {
      name: "Áo khoác nam bomber",
      description:
        "Áo khoác nam kiểu bomber chống nước, giữ ấm tốt, phong cách thể thao",
      price: 799000,
      images: [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1472&auto=format&fit=crop",
      ],
      categoryId: menFashionCategory._id,
      stock: 60,
    }
  );

  // Thời trang nữ
  const womenFashionCategory = findSubcategory("Thời trang nữ");
  products.push(
    {
      name: "Váy liền thân nữ",
      description:
        "Váy liền thân nữ dáng xòe, họa tiết hoa, phong cách nữ tính",
      price: 499000,
      images: [
        "https://images.unsplash.com/photo-1623119435760-26e1d1ea8306?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: womenFashionCategory._id,
      stock: 70,
    },
    {
      name: "Áo sơ mi nữ công sở",
      description:
        "Áo sơ mi nữ công sở chất liệu lụa, kiểu dáng thanh lịch, dễ phối đồ",
      price: 399000,
      images: [
        "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=1374&auto=format&fit=crop",
      ],
      categoryId: womenFashionCategory._id,
      stock: 90,
    },
    {
      name: "Quần jean nữ ống rộng",
      description: "Quần jean nữ ống rộng, lưng cao, phong cách thời thượng",
      price: 599000,
      images: [
        "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=1374&auto=format&fit=crop",
      ],
      categoryId: womenFashionCategory._id,
      stock: 75,
    }
  );

  // Sách tiếng Việt
  const vietnameseBookCategory = findSubcategory("Sách tiếng Việt");
  products.push(
    {
      name: "Nhà Giả Kim",
      description:
        "Tiểu thuyết nổi tiếng của Paulo Coelho, bản dịch tiếng Việt",
      price: 79000,
      images: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1374&auto=format&fit=crop",
      ],
      categoryId: vietnameseBookCategory._id,
      stock: 150,
    },
    {
      name: "Đắc Nhân Tâm",
      description:
        "Sách self-help kinh điển của Dale Carnegie, bản dịch tiếng Việt",
      price: 88000,
      images: [
        "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1476&auto=format&fit=crop",
      ],
      categoryId: vietnameseBookCategory._id,
      stock: 200,
    },
    {
      name: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
      description:
        "Tác phẩm của Rosie Nguyễn về tuổi trẻ và những trải nghiệm sống",
      price: 75000,
      images: [
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1374&auto=format&fit=crop",
      ],
      categoryId: vietnameseBookCategory._id,
      stock: 120,
    }
  );

  // Đồ chơi
  const toyCategory = findSubcategory("Đồ chơi");
  products.push(
    {
      name: "LEGO Classic Creative Bricks",
      description:
        "Bộ đồ chơi LEGO Classic với 300 mảnh ghép nhiều màu sắc, phát triển sáng tạo",
      price: 599000,
      images: [
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: toyCategory._id,
      stock: 40,
    },
    {
      name: "Rubik 3x3",
      description:
        "Khối Rubik 3x3 cổ điển, rèn luyện tư duy logic và khả năng giải quyết vấn đề",
      price: 149000,
      images: [
        "https://images.unsplash.com/photo-1577374994771-3f1b232d5a37?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: toyCategory._id,
      stock: 80,
    },
    {
      name: "Đồ chơi xe điều khiển từ xa",
      description:
        "Xe ô tô điều khiển từ xa tốc độ cao, pin sạc, phù hợp cho trẻ từ 6 tuổi trở lên",
      price: 499000,
      images: [
        "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: toyCategory._id,
      stock: 35,
    }
  );

  // Sản phẩm cho bé
  const babyCategory = findSubcategory("Sản phẩm cho bé");
  products.push(
    {
      name: "Bỉm tã quần Huggies",
      description:
        "Bỉm tã quần Huggies size L (9-14kg), 68 miếng, siêu thấm, chống tràn",
      price: 335000,
      images: [
        "https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?q=80&w=1374&auto=format&fit=crop",
      ],
      categoryId: babyCategory._id,
      stock: 100,
    },
    {
      name: "Sữa bột Enfamil A+",
      description:
        "Sữa bột Enfamil A+ số 2 cho trẻ từ 6-12 tháng, hộp 830g, bổ sung DHA và Choline",
      price: 485000,
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: babyCategory._id,
      stock: 60,
    },
    {
      name: "Xe đẩy em bé gấp gọn",
      description:
        "Xe đẩy em bé gấp gọn, nhẹ, có mái che, phù hợp cho bé từ sơ sinh đến 3 tuổi",
      price: 1990000,
      images: [
        "https://images.unsplash.com/photo-1591341763758-8a6cbd913618?q=80&w=1480&auto=format&fit=crop",
      ],
      categoryId: babyCategory._id,
      stock: 25,
    }
  );

  // Đồ dùng nhà bếp
  const kitchenCategory = findSubcategory("Đồ dùng nhà bếp");
  products.push(
    {
      name: "Nồi cơm điện Philips",
      description: "Nồi cơm điện Philips 1.8L, công nghệ nấu 3D, giữ ấm 24h",
      price: 1290000,
      images: [
        "https://images.unsplash.com/photo-1585837575652-267c041d77d4?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: kitchenCategory._id,
      stock: 40,
    },
    {
      name: "Bộ nồi inox Fivestar",
      description:
        "Bộ 3 nồi inox Fivestar đáy 3 lớp, sử dụng được trên mọi loại bếp",
      price: 890000,
      images: [
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1374&auto=format&fit=crop",
      ],
      categoryId: kitchenCategory._id,
      stock: 30,
    },
    {
      name: "Máy xay sinh tố Sunhouse",
      description: "Máy xay sinh tố Sunhouse 1.5L, công suất 600W, 2 cối xay",
      price: 650000,
      images: [
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: kitchenCategory._id,
      stock: 45,
    }
  );

  // Mỹ phẩm
  const cosmeticCategory = findSubcategory("Mỹ phẩm");
  products.push(
    {
      name: "Son môi 3CE",
      description:
        "Son môi 3CE Velvet Lip Tint, màu sắc tươi tắn, lên màu chuẩn, bền màu",
      price: 320000,
      images: [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1415&auto=format&fit=crop",
      ],
      categoryId: cosmeticCategory._id,
      stock: 70,
    },
    {
      name: "Phấn nước Laneige",
      description:
        "Phấn nước Laneige BB Cushion Pore Control SPF50+, che phủ tốt, kiềm dầu",
      price: 750000,
      images: [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1480&auto=format&fit=crop",
      ],
      categoryId: cosmeticCategory._id,
      stock: 55,
    },
    {
      name: "Nước tẩy trang Bioderma",
      description:
        "Nước tẩy trang Bioderma Sensibio H2O 500ml, dành cho da nhạy cảm",
      price: 420000,
      images: [
        "https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=1374&auto=format&fit=crop",
      ],
      categoryId: cosmeticCategory._id,
      stock: 65,
    }
  );

  // Thực phẩm tươi sống
  const freshFoodCategory = findSubcategory("Thực phẩm tươi sống");
  products.push(
    {
      name: "Thịt bò Úc nhập khẩu",
      description: "Thịt bò Úc nhập khẩu, thăn ngoại, 500g/gói, tươi ngon",
      price: 189000,
      images: [
        "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: freshFoodCategory._id,
      stock: 30,
    },
    {
      name: "Rau cải xanh hữu cơ",
      description: "Rau cải xanh hữu cơ, trồng tại Đà Lạt, 300g/gói",
      price: 35000,
      images: [
        "https://images.unsplash.com/photo-1566842600175-97dca3c5ad8e?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: freshFoodCategory._id,
      stock: 50,
    },
    {
      name: "Cá hồi phi lê",
      description: "Cá hồi phi lê nhập khẩu Na Uy, 300g/khay, giàu omega-3",
      price: 159000,
      images: [
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: freshFoodCategory._id,
      stock: 25,
    }
  );

  // Đồ uống
  const beverageCategory = findSubcategory("Đồ uống");
  products.push(
    {
      name: "Nước ép trái cây tự nhiên",
      description: "Nước ép trái cây tự nhiên 100%, không đường, 1L/chai",
      price: 65000,
      images: [
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1374&auto=format&fit=crop",
      ],
      categoryId: beverageCategory._id,
      stock: 40,
    },
    {
      name: "Cà phê hạt nguyên chất",
      description: "Cà phê hạt nguyên chất Arabica, rang mộc, 500g/gói",
      price: 120000,
      images: [
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: beverageCategory._id,
      stock: 35,
    },
    {
      name: "Trà xanh Nhật Bản",
      description: "Trà xanh Nhật Bản Matcha, 100g/hộp, hương vị đậm đà",
      price: 95000,
      images: [
        "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=1470&auto=format&fit=crop",
      ],
      categoryId: beverageCategory._id,
      stock: 45,
    }
  );

  return products;
};

// Hàm seed dữ liệu
const seedData = async () => {
  try {
    // Kết nối đến MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Đã kết nối đến MongoDB");

    // Kiểm tra xem đã có dữ liệu chưa
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();

    if (productCount > 0 && categoryCount > 0) {
      console.log(
        `Cơ sở dữ liệu đã có ${productCount} sản phẩm và ${categoryCount} danh mục.`
      );
      console.log("Sử dụng flag --reset để xóa dữ liệu cũ trước khi thêm mới.");

      if (!process.argv.includes("--reset")) {
        await mongoose.connection.close();
        return;
      }
    }

    // Xóa dữ liệu cũ nếu có flag --reset
    if (process.argv.includes("--reset")) {
      console.log("Đang xóa dữ liệu cũ...");
      await Category.deleteMany({});
      await Product.deleteMany({});
      console.log("Đã xóa dữ liệu cũ thành công");
    }

    console.log("Bắt đầu quá trình thêm dữ liệu mẫu...");

    // Thêm danh mục chính
    const categoryDocs = await Category.insertMany(categories);
    console.log(`Đã thêm ${categoryDocs.length} danh mục chính`);

    // Tạo map từ tên danh mục đến ID
    const categoryMap = {};
    categoryDocs.forEach((category) => {
      categoryMap[category.name] = category._id;
    });

    // Chuẩn bị danh mục con với ID của danh mục cha
    const subcategoriesWithParents = subcategories.map((subcategory) => ({
      name: subcategory.name,
      description: subcategory.description,
      parentId: categoryMap[subcategory.parentCategory],
    }));

    // Thêm danh mục con
    const subcategoryDocs = await Category.insertMany(subcategoriesWithParents);
    console.log(`Đã thêm ${subcategoryDocs.length} danh mục con`);

    // Tạo và thêm sản phẩm
    const products = generateProducts(categoryDocs, subcategoryDocs);
    const productDocs = await Product.insertMany(products);
    console.log(`Đã thêm ${productDocs.length} sản phẩm`);

    console.log("Quá trình thêm dữ liệu mẫu đã hoàn tất thành công");
  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu mẫu:", error);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("Đã đóng kết nối MongoDB");
  }
};

// Chạy hàm seed
seedData();
