// 模拟外卖数据：多城市、多类别、多平台、不同评分和销量

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  city: string;
  district: string;
  rating: number;       // 1-5
  monthlySales: number;  // 月销量
  distance: number;      // km
  platforms: PlatformInfo[];
  tags: string[];        // 标签，如"不辣""海鲜"等
  dishes: string[];      // 推荐菜品
  photos: string[];      // 菜品/店铺照片
}

export interface PlatformInfo {
  platform: '美团' | '饿了么' | '抖音外卖' | '百度外卖';
  deliveryFee: number;
  minOrder: number;
  discount: string;      // 优惠描述
  estimatedPrice: number; // 预估人均
  deliveryTime: number;   // 分钟
}

const districts = ['朝阳区', '海淀区', '西城区', '东城区', '丰台区', '浦东新区', '徐汇区', '静安区', '天河区', '越秀区'];

const platformTemplates: Record<string, Partial<PlatformInfo>[]> = {
  '美团': [
    { deliveryFee: 3, minOrder: 20, discount: '满30减5', estimatedPrice: 35, deliveryTime: 30 },
    { deliveryFee: 0, minOrder: 25, discount: '满40减8', estimatedPrice: 30, deliveryTime: 35 },
    { deliveryFee: 5, minOrder: 15, discount: '新客减3', estimatedPrice: 40, deliveryTime: 25 },
  ],
  '饿了么': [
    { deliveryFee: 4, minOrder: 20, discount: '满35减6', estimatedPrice: 33, deliveryTime: 32 },
    { deliveryFee: 2, minOrder: 22, discount: '满50减10', estimatedPrice: 38, deliveryTime: 28 },
    { deliveryFee: 0, minOrder: 30, discount: '会员免配送', estimatedPrice: 32, deliveryTime: 35 },
  ],
  '抖音外卖': [
    { deliveryFee: 0, minOrder: 25, discount: '满20减8', estimatedPrice: 28, deliveryTime: 40 },
    { deliveryFee: 3, minOrder: 20, discount: '新用户减10', estimatedPrice: 30, deliveryTime: 38 },
    { deliveryFee: 5, minOrder: 15, discount: '满30减5', estimatedPrice: 35, deliveryTime: 35 },
  ],
  '百度外卖': [
    { deliveryFee: 6, minOrder: 20, discount: '满40减5', estimatedPrice: 38, deliveryTime: 35 },
    { deliveryFee: 3, minOrder: 25, discount: '会员减3', estimatedPrice: 36, deliveryTime: 30 },
    { deliveryFee: 0, minOrder: 30, discount: '满50减8', estimatedPrice: 34, deliveryTime: 33 },
  ],
};

const restaurants: Restaurant[] = [
  // ===== 川菜 =====
  {
    id: 'r1', name: '蜀味香川菜馆', category: '川菜', city: '北京', district: '朝阳区',
    rating: 4.8, monthlySales: 3200, distance: 1.2,
    tags: ['辣', '麻'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 3, minOrder: 25, discount: '满50减10', estimatedPrice: 42, deliveryTime: 30 },
      { platform: '饿了么', deliveryFee: 2, minOrder: 20, discount: '满60减15', estimatedPrice: 40, deliveryTime: 28 },
      { platform: '抖音外卖', deliveryFee: 0, minOrder: 30, discount: '满30减12', estimatedPrice: 35, deliveryTime: 35 },
    ],
  },
  {
    id: 'r2', name: '老成都串串香', category: '川菜', city: '北京', district: '海淀区',
    rating: 4.6, monthlySales: 2800, distance: 2.5,
    tags: ['辣', '串串'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 4, minOrder: 30, discount: '满40减8', estimatedPrice: 38, deliveryTime: 32 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 35, discount: '满60减12', estimatedPrice: 36, deliveryTime: 30 },
      { platform: '百度外卖', deliveryFee: 5, minOrder: 25, discount: '满45减6', estimatedPrice: 40, deliveryTime: 35 },
    ],
  },
  {
    id: 'r3', name: '麻辣诱惑', category: '川菜', city: '上海', district: '浦东新区',
    rating: 4.7, monthlySales: 4100, distance: 1.8,
    tags: ['辣', '麻'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 2, minOrder: 20, discount: '满50减15', estimatedPrice: 45, deliveryTime: 25 },
      { platform: '饿了么', deliveryFee: 3, minOrder: 25, discount: '满40减10', estimatedPrice: 43, deliveryTime: 28 },
      { platform: '抖音外卖', deliveryFee: 0, minOrder: 30, discount: '新用户减15', estimatedPrice: 38, deliveryTime: 38 },
    ],
  },

  // ===== 粤菜 =====
  {
    id: 'r4', name: '粤港海鲜酒楼', category: '粤菜', city: '北京', district: '朝阳区',
    rating: 4.9, monthlySales: 5600, distance: 2.0,
    tags: ['海鲜', '清淡', '高端'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 5, minOrder: 50, discount: '满100减20', estimatedPrice: 88, deliveryTime: 35 },
      { platform: '饿了么', deliveryFee: 3, minOrder: 45, discount: '满80减15', estimatedPrice: 82, deliveryTime: 30 },
    ],
  },
  {
    id: 'r5', name: '点都德茶餐厅', category: '粤菜', city: '广州', district: '天河区',
    rating: 4.7, monthlySales: 7800, distance: 0.8,
    tags: ['茶点', '清淡'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 0, minOrder: 30, discount: '满50减10', estimatedPrice: 48, deliveryTime: 25 },
      { platform: '饿了么', deliveryFee: 2, minOrder: 25, discount: '满60减12', estimatedPrice: 45, deliveryTime: 28 },
      { platform: '抖音外卖', deliveryFee: 3, minOrder: 35, discount: '满40减8', estimatedPrice: 50, deliveryTime: 35 },
    ],
  },
  {
    id: 'r6', name: '潮汕牛肉火锅', category: '粤菜', city: '深圳', district: '南山区',
    rating: 4.8, monthlySales: 3500, distance: 1.5,
    tags: ['牛肉', '火锅', '清淡'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 4, minOrder: 40, discount: '满80减18', estimatedPrice: 65, deliveryTime: 30 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 45, discount: '满100减25', estimatedPrice: 60, deliveryTime: 32 },
    ],
  },

  // ===== 日料 =====
  {
    id: 'r7', name: '元气寿司', category: '日料', city: '北京', district: '朝阳区',
    rating: 4.8, monthlySales: 4200, distance: 1.5,
    tags: ['寿司', '生鱼片', '海鲜'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 5, minOrder: 40, discount: '满80减15', estimatedPrice: 68, deliveryTime: 35 },
      { platform: '饿了么', deliveryFee: 3, minOrder: 35, discount: '满70减12', estimatedPrice: 62, deliveryTime: 32 },
      { platform: '抖音外卖', deliveryFee: 0, minOrder: 45, discount: '满60减20', estimatedPrice: 55, deliveryTime: 40 },
    ],
  },
  {
    id: 'r8', name: '鳗鱼饭专门店', category: '日料', city: '上海', district: '静安区',
    rating: 4.6, monthlySales: 2100, distance: 2.2,
    tags: ['鳗鱼', '海鲜'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 4, minOrder: 35, discount: '满60减10', estimatedPrice: 58, deliveryTime: 30 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 40, discount: '满70减15', estimatedPrice: 52, deliveryTime: 33 },
    ],
  },

  // ===== 韩餐 =====
  {
    id: 'r9', name: '首尔烤肉坊', category: '韩餐', city: '北京', district: '海淀区',
    rating: 4.5, monthlySales: 1900, distance: 3.0,
    tags: ['烤肉', '辣'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 6, minOrder: 45, discount: '满80减15', estimatedPrice: 72, deliveryTime: 38 },
      { platform: '饿了么', deliveryFee: 4, minOrder: 40, discount: '满90减20', estimatedPrice: 68, deliveryTime: 35 },
      { platform: '百度外卖', deliveryFee: 3, minOrder: 50, discount: '满70减10', estimatedPrice: 70, deliveryTime: 40 },
    ],
  },
  {
    id: 'r10', name: '韩式炸鸡啤酒屋', category: '韩餐', city: '北京', district: '朝阳区',
    rating: 4.4, monthlySales: 2500, distance: 1.0,
    tags: ['炸鸡', '小吃'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 2, minOrder: 25, discount: '满30减8', estimatedPrice: 35, deliveryTime: 25 },
      { platform: '抖音外卖', deliveryFee: 0, minOrder: 20, discount: '满25减10', estimatedPrice: 28, deliveryTime: 32 },
    ],
  },

  // ===== 烧烤 =====
  {
    id: 'r11', name: '深夜烤吧', category: '烧烤', city: '北京', district: '朝阳区',
    rating: 4.6, monthlySales: 3800, distance: 1.3,
    tags: ['烤肉', '辣', '宵夜'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 3, minOrder: 35, discount: '满60减12', estimatedPrice: 52, deliveryTime: 32 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 40, discount: '满70减15', estimatedPrice: 48, deliveryTime: 30 },
      { platform: '抖音外卖', deliveryFee: 5, minOrder: 30, discount: '满50减18', estimatedPrice: 45, deliveryTime: 38 },
    ],
  },
  {
    id: 'r12', name: '新疆羊肉串大王', category: '烧烤', city: '北京', district: '丰台区',
    rating: 4.3, monthlySales: 1500, distance: 4.0,
    tags: ['羊肉', '清真'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 5, minOrder: 30, discount: '满50减10', estimatedPrice: 45, deliveryTime: 35 },
      { platform: '饿了么', deliveryFee: 3, minOrder: 35, discount: '满45减8', estimatedPrice: 42, deliveryTime: 38 },
    ],
  },

  // ===== 火锅 =====
  {
    id: 'r13', name: '海底捞外送', category: '火锅', city: '北京', district: '朝阳区',
    rating: 4.9, monthlySales: 9200, distance: 2.5,
    tags: ['火锅', '服务好'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 0, minOrder: 80, discount: '满150减30', estimatedPrice: 120, deliveryTime: 40 },
      { platform: '饿了么', deliveryFee: 5, minOrder: 70, discount: '满200减50', estimatedPrice: 110, deliveryTime: 38 },
    ],
  },
  {
    id: 'r14', name: '呷哺呷哺', category: '火锅', city: '北京', district: '海淀区',
    rating: 4.5, monthlySales: 6100, distance: 1.8,
    tags: ['火锅', '一人食'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 3, minOrder: 35, discount: '满60减12', estimatedPrice: 48, deliveryTime: 28 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 30, discount: '满50减10', estimatedPrice: 42, deliveryTime: 30 },
      { platform: '抖音外卖', deliveryFee: 0, minOrder: 40, discount: '满40减15', estimatedPrice: 38, deliveryTime: 35 },
    ],
  },

  // ===== 快餐 =====
  {
    id: 'r15', name: '真功夫', category: '快餐', city: '北京', district: '朝阳区',
    rating: 4.3, monthlySales: 8500, distance: 0.5,
    tags: ['中餐', '快捷'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 0, minOrder: 20, discount: '满25减5', estimatedPrice: 25, deliveryTime: 20 },
      { platform: '饿了么', deliveryFee: 2, minOrder: 18, discount: '满30减6', estimatedPrice: 23, deliveryTime: 22 },
      { platform: '百度外卖', deliveryFee: 0, minOrder: 25, discount: '满20减3', estimatedPrice: 28, deliveryTime: 25 },
    ],
  },
  {
    id: 'r16', name: '麦当劳', category: '快餐', city: '上海', district: '徐汇区',
    rating: 4.2, monthlySales: 12000, distance: 0.6,
    tags: ['汉堡', '快捷'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 0, minOrder: 18, discount: '满30减8', estimatedPrice: 28, deliveryTime: 22 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 15, discount: '满25减5', estimatedPrice: 25, deliveryTime: 20 },
      { platform: '抖音外卖', deliveryFee: 0, minOrder: 20, discount: '满20减10', estimatedPrice: 22, deliveryTime: 30 },
    ],
  },

  // ===== 面食 =====
  {
    id: 'r17', name: '兰州拉面馆', category: '面食', city: '北京', district: '朝阳区',
    rating: 4.5, monthlySales: 4500, distance: 0.8,
    tags: ['清真', '面食'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 2, minOrder: 18, discount: '满20减4', estimatedPrice: 22, deliveryTime: 25 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 15, discount: '满25减5', estimatedPrice: 20, deliveryTime: 23 },
    ],
  },
  {
    id: 'r18', name: '重庆小面', category: '面食', city: '北京', district: '海淀区',
    rating: 4.7, monthlySales: 3200, distance: 1.5,
    tags: ['辣', '面食'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 0, minOrder: 15, discount: '满20减5', estimatedPrice: 18, deliveryTime: 22 },
      { platform: '饿了么', deliveryFee: 3, minOrder: 18, discount: '满25减6', estimatedPrice: 20, deliveryTime: 25 },
      { platform: '抖音外卖', deliveryFee: 0, minOrder: 20, discount: '满20减8', estimatedPrice: 16, deliveryTime: 30 },
    ],
  },

  // ===== 小吃 =====
  {
    id: 'r19', name: '沙县小吃', category: '小吃', city: '北京', district: '朝阳区',
    rating: 4.1, monthlySales: 6500, distance: 0.4,
    tags: ['经济实惠', '快捷'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 1, minOrder: 12, discount: '满15减3', estimatedPrice: 16, deliveryTime: 20 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 10, discount: '满20减4', estimatedPrice: 15, deliveryTime: 18 },
    ],
  },
  {
    id: 'r20', name: '煎饼果子摊', category: '小吃', city: '北京', district: '东城区',
    rating: 4.4, monthlySales: 3100, distance: 1.0,
    tags: ['早餐', '经济实惠'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 0, minOrder: 10, discount: '满12减2', estimatedPrice: 12, deliveryTime: 18 },
      { platform: '饿了么', deliveryFee: 2, minOrder: 8, discount: '满15减3', estimatedPrice: 11, deliveryTime: 20 },
    ],
  },

  // ===== 西餐 =====
  {
    id: 'r21', name: '必胜客', category: '西餐', city: '北京', district: '朝阳区',
    rating: 4.4, monthlySales: 5500, distance: 1.0,
    tags: ['披萨', '意面'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 0, minOrder: 40, discount: '满80减20', estimatedPrice: 58, deliveryTime: 28 },
      { platform: '饿了么', deliveryFee: 3, minOrder: 35, discount: '满70减15', estimatedPrice: 55, deliveryTime: 30 },
      { platform: '抖音外卖', deliveryFee: 0, minOrder: 45, discount: '满60减25', estimatedPrice: 48, deliveryTime: 35 },
    ],
  },
  {
    id: 'r22', name: '萨莉亚', category: '西餐', city: '上海', district: '浦东新区',
    rating: 4.3, monthlySales: 4800, distance: 1.2,
    tags: ['意面', '经济实惠'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 2, minOrder: 25, discount: '满40减8', estimatedPrice: 32, deliveryTime: 25 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 20, discount: '满35减6', estimatedPrice: 28, deliveryTime: 28 },
    ],
  },

  // ===== 东南亚菜 =====
  {
    id: 'r23', name: '泰香阁', category: '东南亚菜', city: '北京', district: '朝阳区',
    rating: 4.6, monthlySales: 1800, distance: 2.8,
    tags: ['泰国菜', '酸辣', '海鲜'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 5, minOrder: 40, discount: '满70减12', estimatedPrice: 55, deliveryTime: 33 },
      { platform: '饿了么', deliveryFee: 3, minOrder: 35, discount: '满80减18', estimatedPrice: 50, deliveryTime: 35 },
    ],
  },
  {
    id: 'r24', name: '越南河粉', category: '东南亚菜', city: '北京', district: '海淀区',
    rating: 4.5, monthlySales: 1200, distance: 3.5,
    tags: ['越南菜', '清淡'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 4, minOrder: 30, discount: '满50减8', estimatedPrice: 38, deliveryTime: 30 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 35, discount: '满45减10', estimatedPrice: 35, deliveryTime: 33 },
    ],
  },

  // ===== 东北菜 =====
  {
    id: 'r25', name: '东北饺子馆', category: '东北菜', city: '北京', district: '朝阳区',
    rating: 4.6, monthlySales: 3600, distance: 1.0,
    tags: ['饺子', '实惠'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 2, minOrder: 20, discount: '满30减6', estimatedPrice: 25, deliveryTime: 22 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 18, discount: '满25减5', estimatedPrice: 22, deliveryTime: 25 },
      { platform: '抖音外卖', deliveryFee: 0, minOrder: 25, discount: '满25减10', estimatedPrice: 20, deliveryTime: 30 },
    ],
  },
  {
    id: 'r26', name: '铁锅炖大鹅', category: '东北菜', city: '北京', district: '丰台区',
    rating: 4.4, monthlySales: 2000, distance: 3.8,
    tags: ['炖菜', '实惠', '肉类'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 6, minOrder: 50, discount: '满80减15', estimatedPrice: 62, deliveryTime: 38 },
      { platform: '百度外卖', deliveryFee: 4, minOrder: 45, discount: '满70减12', estimatedPrice: 58, deliveryTime: 35 },
    ],
  },

  // ===== 北京朝阳区额外的多样品类 =====
  {
    id: 'r27', name: '味千拉面', category: '面食', city: '北京', district: '朝阳区',
    rating: 4.4, monthlySales: 2900, distance: 1.6,
    tags: ['日式拉面', '面食'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 3, minOrder: 30, discount: '满40减8', estimatedPrice: 35, deliveryTime: 26 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 28, discount: '满45减10', estimatedPrice: 32, deliveryTime: 28 },
    ],
  },
  {
    id: 'r28', name: '杨国福麻辣烫', category: '川菜', city: '北京', district: '朝阳区',
    rating: 4.3, monthlySales: 4800, distance: 0.7,
    tags: ['麻辣烫', '辣'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 0, minOrder: 18, discount: '满25减6', estimatedPrice: 22, deliveryTime: 22 },
      { platform: '饿了么', deliveryFee: 2, minOrder: 15, discount: '满20减5', estimatedPrice: 20, deliveryTime: 24 },
      { platform: '抖音外卖', deliveryFee: 0, minOrder: 20, discount: '满20减8', estimatedPrice: 18, deliveryTime: 30 },
    ],
  },
  {
    id: 'r29', name: '汉堡王', category: '快餐', city: '北京', district: '朝阳区',
    rating: 4.3, monthlySales: 7200, distance: 0.9,
    tags: ['汉堡', '快捷'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 0, minOrder: 20, discount: '满35减8', estimatedPrice: 30, deliveryTime: 22 },
      { platform: '饿了么', deliveryFee: 0, minOrder: 18, discount: '满30减6', estimatedPrice: 28, deliveryTime: 20 },
    ],
  },
  {
    id: 'r30', name: '聚宝源涮肉', category: '火锅', city: '北京', district: '东城区',
    rating: 4.8, monthlySales: 3300, distance: 3.2,
    tags: ['铜锅', '羊肉', '清真'],
    dishes: [],
    photos: [],
    platforms: [
      { platform: '美团', deliveryFee: 5, minOrder: 60, discount: '满100减20', estimatedPrice: 85, deliveryTime: 38 },
      { platform: '饿了么', deliveryFee: 3, minOrder: 55, discount: '满120减30', estimatedPrice: 78, deliveryTime: 35 },
    ],
  },
];

export default restaurants;
