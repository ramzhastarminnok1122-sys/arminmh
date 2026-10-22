// داده‌های اولیه کسب‌وکار — همه از پنل مدیریت قابل ویرایش هستند
import imgSale from '../assets/images/banner-sale.jpg';
import imgInstall from '../assets/images/banner-install.jpg';
import imgBattery from '../assets/images/battery-product.jpg';
import imgTeam from '../assets/images/about-team.jpg';
import imgShop from '../assets/images/shop.jpg';
import imgVan from '../assets/images/hero-van.jpg';

const H = 3600 * 1000, D = 24 * H;
const now = Date.now();

export const ICON_CHOICES = [
  'bolt', 'battery', 'wrench', 'gauge', 'truck', 'anchor', 'search', 'pin',
  'clock', 'shield', 'phone', 'star', 'car', 'tag', 'check'
];

export function seed() {
  return {
    __v: 3,
    // ---------- تنظیمات کسب‌وکار ----------
    settings: {
      brandName: 'امداد باطری شبانه‌روزی چابهار',
      brandShort: 'امداد باتری چابهار',
      tagline: 'شبانه‌روزی، در محل شما',
      emergencyPhone: '0915 346 7788',
      whatsapp: '0915 346 7788',
      officePhone: '054 3531 4470',
      instagram: 'chabahar.battery',
      telegram: 'chabahar_battery24',
      address: 'چابهار، بلوار ملت، جنب میدان چابهار، پلاک ۲۴',
      hours: 'شبانه‌روزی، ۷ روز هفته — حتی تعطیلات',
      status: 'active', // active | limited | offline
      statusMessage: 'به دلیل حجم بالای درخواست‌ها، زمان اعزام ممکن است کمی بیشتر شود.',
      adminPassword: '123654',
      ownerPw: '123654',
      notify: { ntfyTopic: '', ownerPhone: '', smsEnabled: false },
      payCard: { number: '6037 9917 4421 0583', holder: 'امداد باتری چابهار', bank: 'بانک ملی ایران' },
      limits: { maxActive: 3, maxDaily: 5 },
      deposit: {
        enabled: true, amount: 80000,
        note: 'اگر امدادگر به محل شما برسد و کسی حضور نداشته باشد، ودیعه به‌عنوان هزینه وقت تلف‌شده امدادگر برقرار می‌ماند. در غیر این صورت، کامل از فاکتور شما کسر می‌شود.'
      },
      aboutShort: 'امداد باتری چابهار از سال ۱۳۹۶ در کنار رانندگان این شهر و بندر است؛ تیمی محلی که شب و روز، در هر هوا و هر آدرسی، مشکل باتری خودرو را همان‌جا حل می‌کند.'
    },

    // ---------- محتوای صفحه اصلی ----------
    homeContent: {
      hero: {
        badge: 'پاسخگویی ۲۴ ساعته در چابهار و کنارک',
        title: 'باتری خوابیده؟ ما راه می‌افتیم. ⚡',
        subtitle: 'امداد باتری شبانه‌روزی در چابهار؛ اعزام فوری تکنسین، تست دیجیتال دینام و تعویض باتری با گارانتی معتبر در محل شما.',
        cta1: 'درخواست امداد فوری',
        cta2: 'فروشگاه باتری با تخفیف'
      },
      stats: {
        enabled: true,
        items: [
          { n: '۳٬۸۰۰+', l: 'سرویس موفق' },
          { n: '۴٫۹', l: 'امتیاز رضایت مشتری' },
          { n: '۲۴/۷', l: 'شبانه‌روزی' },
          { n: '۳۰ دقیقه', l: 'میانگین زمان اعزام' }
        ]
      },
      trust: {
        enabled: true,
        items: [
          { icon: 'clock', title: 'اعزام سریع', desc: 'میانگین ۳۰ دقیقه در محدوده چابهار' },
          { icon: 'shield', title: 'ضمانت کتبی', desc: '۱۲ تا ۲۴ ماه گارانتی باتری‌های نو' },
          { icon: 'phone', title: 'پاسخ مستقیم', desc: 'بدون منشی؛ مستقیم با امدادگر (حمید)' },
          { icon: 'pin', title: 'مخصوص چابهار', desc: 'مسلط به تمام محلات، اسکله و جاده‌ها' }
        ]
      },
      services: { enabled: true, title: 'خدمات تخصصی ما', desc: 'هر مشکلی که پای باتری و برق خودرو در میان باشد، ما راه‌حلش را داریم — سرپایی، در محل شما.' },
      offers: { enabled: true, title: 'آفرهای ویژه و کدهای تخفیف', desc: 'فرصت‌های محدود با تایمر معکوس زنده؛ تا وقتی موجودی و مهلت اجازه می‌دهد.' },
      reviews: { enabled: true, title: 'مشتریان چه می‌گویند', desc: 'نظرهای واقعی رانندگانی که نیمه‌شب در جاده یا شهر همراهشان بودیم.' },
      cta: {
        enabled: true,
        title: 'همین حالا امداد بخواهید',
        desc: 'یک تماس یا ثبت فرم آنلاین کافی است؛ بقیه‌اش با ما. واحد سیار امداد بلافاصله راه می‌افتد.',
        btn: 'ثبت درخواست امداد'
      }
    },

    // ---------- خدمات ----------
    services: [
      { id: 'sv1', icon: 'bolt', title: 'راه‌اندازی باتری خوابیده', desc: 'با کابل و دستگاه راه‌اندازی استاندارد، خودروی شما را همان‌جا روشن می‌کنیم — بدون آسیب به ECU و بدون نیاز به یدک‌کش.', priceFrom: 150000, duration: '۱۰ تا ۲۰ دقیقه', order: 1, active: true },
      { id: 'sv2', icon: 'battery', title: 'تعویض باتری در محل', desc: 'باتری نو با گارانتی معتبر، نصب سرپایی و تحویل باتری قدیمی؛ همه در محل شما با نصب رایگان.', priceFrom: 0, duration: '۲۰ تا ۳۰ دقیقه', order: 2, active: true },
      { id: 'sv3', icon: 'gauge', title: 'تست سلامت باتری و دینام', desc: 'با دستگاه تستر دیجیتال، وضعیت باتری، دینام و سیستم شارژ را دقیق می‌سنجیم.', priceFrom: 0, duration: '۱۰ دقیقه', order: 3, active: true },
      { id: 'sv4', icon: 'truck', title: 'باتری خودروهای سنگین', desc: 'تاور، کامیون، اتوبوس و ماشین‌آلات سنگین؛ باتری‌های ۱۰۰ تا ۱۸۰ آمپر همیشه در واحد سیار موجود است.', priceFrom: 0, duration: '۳۰ تا ۴۵ دقیقه', order: 4, active: true },
      { id: 'sv5', icon: 'anchor', title: 'باتری شناور و قایق', desc: 'خدمات تخصصی باتری لنج، قایق و شناورهای تفریحی و صیادی اسکله چابهار و کنارک.', priceFrom: 0, duration: 'هماهنگی تلفنی', order: 5, active: true },
      { id: 'sv6', icon: 'search', title: 'چکاپ رایگان پیش از سفر', desc: 'قبل از سفر جاده‌ای، باتری و سیستم برق خودرویتان را رایگان چک می‌کنیم.', priceFrom: 0, duration: '۱۰ دقیقه', order: 6, active: true },
      { id: 'sv7', icon: 'pin', title: 'ارسال باتری به محل شما', desc: 'باتری دلخواه‌تان را از فروشگاه به خانه یا محل کارتان می‌رسانیم و همان‌جا نصب می‌کنیم.', priceFrom: 0, duration: 'طبق هماهنگی', order: 7, active: true }
    ],

    // ---------- آفرها (همراه با کد تخفیف و تاریخ انقضا) ----------
    offers: [
      {
        id: 'of1',
        title: '۱۵٪ تخفیف ویژه باتری‌های سیلد',
        desc: 'روی تمام مدل‌های سیلد برند سپاهان و نیرو همراه با تست دیجیتال رایگان دینام در محل.',
        code: 'CHB15',
        discountPercent: 15,
        image: imgSale,
        oldPrice: 4650000,
        newPrice: 3950000,
        start: now - 2 * D,
        end: now + 9 * D,
        expiresAt: new Date(now + 9 * D).toISOString(),
        active: true
      },
      {
        id: 'of2',
        title: 'نصب رایگان در محل با خرید باتری نو',
        desc: 'با هر خرید باتری نو از فروشگاه، هزینه اعزام، نصب سرپایی و تست دینام کاملاً رایگان محاسبه می‌شود.',
        code: 'FREEINSTALL',
        discountPercent: 10,
        image: imgInstall,
        oldPrice: 4800000,
        newPrice: 4320000,
        start: now - 1 * D,
        end: now + 18 * D,
        expiresAt: new Date(now + 18 * D).toISOString(),
        active: true
      },
      {
        id: 'of3',
        title: 'پکیج کامل چکاپ پیش از سفر',
        desc: 'تست سلامت باتری + بررسی ولتاژ دینام + سرویس سرقطبی‌ها و کابل‌ها، یکجا با ۳۰٪ تخفیف.',
        code: 'SAFAR30',
        discountPercent: 30,
        image: imgTeam,
        oldPrice: 350000,
        newPrice: 245000,
        start: now - 6 * H,
        end: now + 4 * D,
        expiresAt: new Date(now + 4 * D).toISOString(),
        active: true
      }
    ],

    // ---------- بنرهای تبلیغاتی ----------
    banners: [
      { id: 'bn1', title: 'جشنواره فروش باتری‌های سیلد', subtitle: 'تا ۱۵٪ تخفیف روی برندهای معتبر + نصب رایگان در محل شما (کد تخفیف: CHB15)', discount: '۱۵٪ تخفیف', imageDesktop: imgSale, imageMobile: imgSale, link: '/batteries', order: 1, active: true },
      { id: 'bn2', title: 'نصب رایگان در سراسر چابهار', subtitle: 'اعزام فوری تکنسین و نصب سرپایی باتری در هر ساعت شبانه‌روز', discount: 'نصب رایگان', imageDesktop: imgInstall, imageMobile: imgInstall, link: '/emergency', order: 2, active: true }
    ],

    // ---------- فروشگاه باتری (قیمت‌های دوحالته: قیمت اصلی خط‌خورده + قیمت پس از تخفیف) ----------
    batteries: [
      { id: 'bt1', brand: 'سپاهان', model: 'SE 60 سیلد', capacity: 60, cca: 540, type: 'سیلد (MF)', warranty: 12, price: 4150000, oldPrice: 4650000, stock: 'in', suitable: 'پراید، تیبا، کوییک، پژو ۴۰۵، سمند', image: imgBattery, active: true },
      { id: 'bt2', brand: 'سپاهان', model: 'SE 74 سیلد', capacity: 74, cca: 640, type: 'سیلد (MF)', warranty: 12, price: 5300000, oldPrice: 5950000, stock: 'in', suitable: 'پژو پارس، ۲۰۶، رانا، دنا، شاهین', image: imgBattery, active: true },
      { id: 'bt3', brand: 'نیرو', model: 'N 55 اتمی', capacity: 55, cca: 500, type: 'سیلد (MF)', warranty: 10, price: 3350000, oldPrice: 3780000, stock: 'in', suitable: 'پراید، نیسان، وانت‌های سبک', image: imgBattery, active: true },
      { id: 'bt4', brand: 'نیرو', model: 'AGM 66', capacity: 66, cca: 660, type: 'AGM', warranty: 24, price: 7900000, oldPrice: 8600000, stock: 'low', suitable: 'خودروهای اتوماتیک و دارای استارت‌استاپ', image: imgBattery, active: true },
      { id: 'bt5', brand: 'آتلوس', model: 'AT 100 سنگین', capacity: 100, cca: 800, type: 'سیلد (MF)', warranty: 12, price: 9600000, oldPrice: 10800000, stock: 'in', suitable: 'تاور، کامیون سبک، آمبولانس', image: imgBattery, active: true },
      { id: 'bt6', brand: 'دلکور', model: 'DX 70 کره‌ای', capacity: 70, cca: 620, type: 'سیلد (MF)', warranty: 18, price: 6450000, oldPrice: 7200000, stock: 'in', suitable: 'هیوندای، کیا، تویوتا', image: imgBattery, active: true },
      { id: 'bt7', brand: 'سولایت', model: 'SL 60 سیلد', capacity: 60, cca: 560, type: 'سیلد (MF)', warranty: 12, price: 4700000, oldPrice: 5150000, stock: 'in', suitable: 'خودروهای کره‌ای و چینی (ام‌وی‌ام، جک)', image: imgBattery, active: true },
      { id: 'bt8', brand: 'نیرو', model: 'MB 12 موتورسیکلت', capacity: 12, cca: 150, type: 'اسیدی', warranty: 6, price: 850000, oldPrice: 980000, stock: 'low', suitable: 'موتورسیکلت‌های ۱۲۵ تا ۲۵۰ سی‌سی', image: imgBattery, active: true }
    ],
    priceHistory: [
      { id: 'ph1', batteryId: 'bt1', label: 'سپاهان SE 60 سیلد', at: now - 12 * D, old: 4650000, price: 4150000 },
      { id: 'ph2', batteryId: 'bt4', label: 'نیرو AGM 66', at: now - 8 * D, old: 8600000, price: 7900000 },
      { id: 'ph3', batteryId: 'bt7', label: 'سولایت SL 60', at: now - 5 * D, old: 5150000, price: 4700000 }
    ],

    // ---------- امدادگران ----------
    technicians: [
      { id: 'tc1', name: 'حمید', phone: '0915 346 7788', zone: 'تمامی مناطق چابهار و حومه', rating: 4.9, completed: 1812, online: true, color: '#1e6bff', password: '123' }
    ],

    // ---------- مناطق تحت پوشش ----------
    areas: [
      { id: 'ar1', name: 'تمامی مناطق چابهار و کنارک', desc: 'از تیس و منطقه آزاد تا بلوار ملت، کنارک و اسکله — خدمات شبانه‌روزی بدون محدودیت نقطه‌ای در منطقه', eta: '۱۵ تا ۳۰ دقیقه', map: { x: 445, y: 300 }, active: true }
    ],

    // ---------- نظرات مشتریان ----------
    reviews: [
      { id: 'rv1', name: 'مهدی قنبرزایی', text: 'نیمه‌شب جاده تیس ماشینم روشن نشد. تماس گرفتم، کمتر از نیم‌ساعت امدادگر بود و ماشین روشن شد. پول کارت هم همان‌جا زدم. دست‌تان درد نکند.', rating: 5, approved: true, featured: true, at: now - 2 * D },
      { id: 'rv2', name: 'زهرا بلوچ', text: 'برای خرید باتری رفتم؛ مشاوره‌اش صادقانه بود و گران‌تر از نیاز من نفروخت. نصب هم سرپایی انجام شد. برخوردشان عالی است.', rating: 5, approved: true, featured: true, at: now - 5 * D },
      { id: 'rv3', name: 'عبدالرحمن ریک', text: 'تاورم وسط جاده فرودگاه خوابید. با اینکه باران و طوفان بود، آمدند و ۱۰۰ آمپر نصب کردند. قیمتش هم همان توافقی بود.', rating: 5, approved: true, featured: true, at: now - 9 * D },
      { id: 'rv4', name: 'سعید ملازایی', text: 'تست باتری رایگان انجام دادند و گفتند هنوز سالم است، لازم به تعویض نیست. این صداقت خیلی کم پیدا می‌شود.', rating: 5, approved: true, featured: false, at: now - 13 * D },
      { id: 'rv5', name: 'مینا دهقان', text: 'ساعت ۵ صبح برای سفر مشکوک بودم؛ تماس تلفنی راهنمایی‌ام کردند و بعد صبح آمدند دقیق بررسی کردند.', rating: 4, approved: true, featured: false, at: now - 18 * D },
      { id: 'rv6', name: 'حمید نودین', text: 'باتری AGM سفارش دادم، فردا صبح تحویل خانه گرفتم. فاکتور رسمی هم دادند.', rating: 5, approved: true, featured: false, at: now - 24 * D }
    ],

    // ---------- رسانه ----------
    media: [
      { id: 'md1', type: 'image', url: imgVan, title: 'واحد گشت شبانه امداد باتری در بلوار ساحلی چابهار', at: now - 4 * D },
      { id: 'md2', type: 'image', url: imgTeam, title: 'تست و نصب تخصصی باتری توسط تکنسین مجرب', at: now - 10 * D },
      { id: 'md3', type: 'image', url: imgShop, title: 'مرکز تخصصی باتری و تست دیجیتال — بلوار ملت', at: now - 16 * D }
    ],

    // ---------- سوالات متداول ----------
    faqs: [
      { id: 'fq1', q: 'چقدر طول می‌کشد تا امدادگر برسد؟', a: 'در محدوده مرکزی چابهار معمولاً بین ۱۵ تا ۳۰ دقیقه. برای مناطق دورتر مانند تیس، ناو یا کنارک بسته به موقعیت، ۳۰ تا ۶۰ دقیقه زمان نیاز است. بعد از ثبت درخواست، زمان دقیق‌تر اعلام می‌شود.', category: 'سفارش و اعزام', order: 1, active: true },
      { id: 'fq2', q: 'شبانه‌روزی واقعاً یعنی چه؟ حتی ۳ بامداد؟', a: 'بله. خط امداد ما همیشه پاسخ می‌دهد؛ ۳ بامداد، جمعه‌ها و حتی عید. ما خودمان راننده‌ایم و می‌دانیم خودرو ساعتش را انتخاب نمی‌کند.', category: 'سفارش و اعزام', order: 2, active: true },
      { id: 'fq3', q: 'پرداخت چطور انجام می‌شود؟', a: 'از طریق درگاه آنلاین زرین‌پال در سایت و یا کارت‌خوان سیار در محل. مبلغ ودیعه حضور (۸۰ هزار تومان) به صورت خودکار و دقیق از فاکتور نهایی شما کسر می‌گردد.', category: 'پرداخت', order: 3, active: true },
      { id: 'fq4', q: 'باتری‌های شما گارانتی دارند؟', a: 'تمام باتری‌های نو دارای گارانتی رسمی ۶ تا ۲۴ ماهه بسته به برند و نوع باتری هستند. فاکتور و برگه گارانتی همان‌جا تحویل داده می‌شود.', category: 'باتری و گارانتی', order: 4, active: true },
      { id: 'fq5', q: 'باتری قدیمی من را می‌خرید؟', a: 'بله، باتری مستعمل شما را به‌عنوان اسقاطی خریداری و مبلغش از صورت‌حساب کسر می‌کنیم.', category: 'باتری و گارانتی', order: 5, active: true },
      { id: 'fq6', q: 'اگر مشکل از باتری نبود چه؟', a: 'امدادگر ما قبل از هر کاری باتری و دینام را تست می‌کند. اگر مشکل جای دیگری باشد، صادقانه می‌گوید و هزینه امداد فقط به‌ازای اعزام دریافت می‌شود؛ چیزی که لازم ندارید نمی‌فروشیم.', category: 'عمومی', order: 6, active: true },
      { id: 'fq7', q: 'برای خودروهای سنگین هم خدمات دارید؟', a: 'بله؛ باتری‌های ۱۰۰ تا ۱۸۰ آمپر برای تاور، کامیون و ماشین‌آلات سنگین همیشه در باری است و امدادگر مجرب همان تجهیزات را همراه دارد.', category: 'عمومی', order: 7, active: true },
      { id: 'fq8', q: 'می‌توانم باتری را به آدرس بفرستم تا نصب کنند؟', a: 'بله، از صفحه فروشگاه باتری سفارش دهید؛ باتری به آدرس شما ارسال و همان‌جا نصب و تست می‌شود.', category: 'سفارش و اعزام', order: 8, active: true }
    ],

    // ---------- درخواست‌های امداد ----------
    requests: [
      {
        id: 'rq1', code: 'CHB-314507', name: 'اکبر سلطان‌زایی', phone: '0915 221 4408', problem: 'باتری خوابیده',
        vehicle: { brand: 'پراید', model: '131', year: '1396' },
        location: { desc: 'جاده تیس، جنب پمپ بنزین', x: 300, y: 230 },
        notes: 'چراغ‌ها روشن می‌شود ولی استارت نمی‌خورد.',
        deposit: { status: 'approved', paid: true, amount: 80000 },
        status: 'done', createdAt: now - 3 * D, enrouteAt: now - 3 * D + 130000, arrivedAt: now - 3 * D + 320000, doneAt: now - 3 * D + 480000,
        technicianId: 'tc1', travel: 190, manualHold: false,
        timeline: [
          { status: 'new', at: now - 3 * D }, { status: 'reviewing', at: now - 3 * D + 40000 },
          { status: 'assigned', at: now - 3 * D + 90000 }, { status: 'enroute', at: now - 3 * D + 130000 },
          { status: 'arrived', at: now - 3 * D + 320000 }, { status: 'done', at: now - 3 * D + 480000 }
        ],
        internalNotes: [{ at: now - 3 * D + 100000, text: 'مشتری عجله دارد برای سفر؛ اولویت اعزام.' }],
        report: { battery: 'نیرو N 55 اتمی', oldState: 'سلول معیوب — غیرقابل شارژ', price: 3350000, note: 'باتری تعویض و دینام تست شد؛ شارژدهی سالم.' }
      },
      {
        id: 'rq2', code: 'CHB-288134', name: 'نرگس شهبخش', phone: '0912 664 1902', problem: 'روشن نمی‌شود',
        vehicle: { brand: 'پژو', model: '206', year: '1398' },
        location: { desc: 'بلوار شهدا، روبه‌روی پارک شهر', x: 530, y: 260 },
        notes: '',
        deposit: { status: 'approved', paid: true, amount: 80000 },
        status: 'done', createdAt: now - 2 * D - 5 * H, enrouteAt: now - 2 * D - 5 * H + 120000, arrivedAt: now - 2 * D - 5 * H + 290000, doneAt: now - 2 * D - 5 * H + 430000,
        technicianId: 'tc1', travel: 170, manualHold: false,
        timeline: [
          { status: 'new', at: now - 2 * D - 5 * H }, { status: 'reviewing', at: now - 2 * D - 5 * H + 35000 },
          { status: 'assigned', at: now - 2 * D - 5 * H + 80000 }, { status: 'enroute', at: now - 2 * D - 5 * H + 120000 },
          { status: 'arrived', at: now - 2 * D - 5 * H + 290000 }, { status: 'done', at: now - 2 * D - 5 * H + 430000 }
        ],
        internalNotes: [], report: { battery: '—', oldState: 'باتری سالم؛ اتصالات شل بود', price: 250000, note: 'قطب‌ها تمیز و سفت شد؛ توصیه به تست مجدد پس از یک هفته.' }
      },
      {
        id: 'rq3', code: 'CHB-509221', name: 'حاج عبدل کمسرایی', phone: '0915 887 3310', problem: 'خودروی سنگین',
        vehicle: { brand: 'بنز', model: 'تاور 1924', year: '1390' },
        location: { desc: 'منطقه آزاد، جنب دروازه بندر', x: 640, y: 345 },
        notes: 'باتری ۱۸۰ آمپر لازم دارم.',
        deposit: { status: 'approved', paid: true, amount: 80000 },
        status: 'done', createdAt: now - 6 * D - 2 * H, enrouteAt: now - 6 * D - 2 * H + 150000, arrivedAt: now - 6 * D - 2 * H + 400000, doneAt: now - 6 * D - 2 * H + 620000,
        technicianId: 'tc1', travel: 250, manualHold: false,
        timeline: [
          { status: 'new', at: now - 6 * D - 2 * H }, { status: 'reviewing', at: now - 6 * D - 2 * H + 45000 },
          { status: 'assigned', at: now - 6 * D - 2 * H + 100000 }, { status: 'enroute', at: now - 6 * D - 2 * H + 150000 },
          { status: 'arrived', at: now - 6 * D - 2 * H + 400000 }, { status: 'done', at: now - 6 * D - 2 * H + 620000 }
        ],
        internalNotes: [], report: { battery: 'آتلوس AT 100 سنگین', oldState: 'کاملاً فرسوده', price: 9600000, note: 'دو عدد باتری سری شد؛ تست alternator انجام شد.' }
      },
      {
        id: 'rq4', code: 'CHB-702345', name: 'فیض محمدبلوچ', phone: '0913 402 7765', problem: 'تست باتری',
        vehicle: { brand: 'سمند', model: 'LX', year: '1394' },
        location: { desc: 'بلوار ملت، جنب فروشگاه', x: 445, y: 310 },
        notes: 'قبل از سفر می‌خواهم مطمئن شوم.',
        deposit: { status: 'waived', paid: false, amount: 0 },
        status: 'done', createdAt: now - 9 * D, enrouteAt: now - 9 * D + 110000, arrivedAt: now - 9 * D + 250000, doneAt: now - 9 * D + 360000,
        technicianId: 'tc1', travel: 140, manualHold: false,
        timeline: [
          { status: 'new', at: now - 9 * D }, { status: 'reviewing', at: now - 9 * D + 30000 },
          { status: 'assigned', at: now - 9 * D + 70000 }, { status: 'enroute', at: now - 9 * D + 110000 },
          { status: 'arrived', at: now - 9 * D + 250000 }, { status: 'done', at: now - 9 * D + 360000 }
        ],
        internalNotes: [], report: { battery: '—', oldState: 'سلامت — ولتاژ ۱۲٫۶', price: 0, note: 'تست رایگان؛ بدون نیاز به تعویض.' }
      },
      {
        id: 'rq5', code: 'CHB-208514', name: 'محدثه بلوچ‌زایی', phone: '0915 776 2091', problem: 'باتری خوابیده',
        vehicle: { brand: 'کوییک', model: 'R', year: '1401' },
        location: { desc: 'شهرک شهید بهشتی، فاز ۲، میدان اصلی', x: 585, y: 295 },
        notes: 'خودرو در پارکینگ اختصاصی است، پلاک ۱۴.',
        deposit: { status: 'approved', paid: true, amount: 80000 },
        status: 'enroute', createdAt: now - 110000, enrouteAt: now - 25000, technicianId: 'tc1', travel: 200, manualHold: false,
        timeline: [
          { status: 'new', at: now - 110000 }, { status: 'reviewing', at: now - 82000 },
          { status: 'assigned', at: now - 55000 }, { status: 'enroute', at: now - 25000 }
        ],
        internalNotes: [], report: null
      }
    ],

    // ---------- سفارش‌های فروشگاه ----------
    orders: [
      { id: 'or1', batteryId: 'bt2', batteryLabel: 'سپاهان SE 74 سیلد', name: 'سیب محمودی', phone: '0915 112 8834', vehicle: 'پژو پارس ۱۴۰۰', address: 'بلوار ملت، کوچه ۱۲', price: 5300000, paid: true, status: 'تحویل و نصب شد', createdAt: now - 4 * D }
    ],

    // ---------- پیام‌های تماس با ما ----------
    messages: [
      { id: 'ms1', name: 'بهروز سرانی', phone: '0915 990 1123', text: 'برای ماشین‌آلات معدن بینجار هم اعزام دارید؟', at: now - 26 * H, read: false }
    ],

    // ---------- اسلایدشو صفحه اصلی ----------
    slides: [
      { id: 'sl1', image: imgVan, title: 'امداد شبانه‌روزی در سراسر چابهار', subtitle: 'اعزام فوری واحد سیار مجهز در کمتر از ۳۰ دقیقه به محل خودروی شما', badge: 'شبانه‌روزی ۲۴/۷', link: '/emergency', order: 1, active: true },
      { id: 'sl2', image: imgSale, title: 'جشنواره فروش باتری‌های سیلد و اتمی', subtitle: 'تا ۱۵٪ تخفیف ویژه روی برندهای برتر + کد تخفیف CHB15', badge: 'تخفیف هفته', link: '/batteries', order: 2, active: true },
      { id: 'sl3', image: imgInstall, title: 'نصب و تست دیجیتال دینام رایگان', subtitle: 'با خرید هر باتری نو، نصب سرپایی و تست سلامت سیستم برق کاملاً رایگان است', badge: 'نصب رایگان', link: '/offers', order: 3, active: true },
      { id: 'sl4', image: imgTeam, title: 'تکنسین‌های مجرب و بومی چابهار', subtitle: 'سال‌ها تجربه، تشخیص صادقانه و گارانتی معتبر شرکتی', badge: 'اعتماد محلی', link: '/about', order: 4, active: true }
    ],

    // ---------- گالری ----------
    galleryCats: [
      { id: 'gc1', name: 'نصب باتری خودرو', order: 1 },
      { id: 'gc2', name: 'امداد شبانه', order: 2 },
      { id: 'gc3', name: 'فروشگاه و تیم', order: 3 },
      { id: 'gc4', name: 'سنگین و شناور', order: 4 }
    ],
    galleryItems: [
      { id: 'gi1', catId: 'gc2', image: imgVan, title: 'اعزام واحد امداد شبانه در بلوار ساحلی چابهار', at: now - 2 * D },
      { id: 'gi2', catId: 'gc1', image: imgTeam, title: 'نصب و تست دیجیتال باتری و دینام در محل مشتری', at: now - 5 * D },
      { id: 'gi3', catId: 'gc3', image: imgBattery, title: 'قفسه باتری‌های سیلد و AGM نو با گارانتی اصلی', at: now - 9 * D },
      { id: 'gi4', catId: 'gc3', image: imgShop, title: 'مرکز تخصصی باتری و تست برق خودرو — بلوار ملت', at: now - 12 * D },
      { id: 'gi5', catId: 'gc1', image: imgInstall, title: 'پروموشن نصب رایگان و تست سلامت شارژ در محل', at: now - 15 * D },
      { id: 'gi6', catId: 'gc4', image: imgSale, title: 'باتری‌های قدرتمند صنعتی و سنگین آماده تحویل', at: now - 18 * D }
    ],

    // ---------- مشتریان و پرداخت‌ها ----------
    users: [],
    payments: [],

    garage: [
      { id: 'gr1', phone: '09153467788', brand: 'پیکان', model: 'وانت', year: '1385' }
    ]
  };
}
