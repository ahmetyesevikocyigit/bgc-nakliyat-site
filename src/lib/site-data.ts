import {
  BadgeCheck,
  Boxes,
  Building2,
  Clock,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";

export const company = {
  name: "BGC Nakliyat",
  slogan: "İstanbul’da güvenli, hızlı ve planlı taşımacılık",
  phoneDisplay: "0530 846 19 34",
  phoneHref: "tel:+905308461934",
  whatsappHref:
    "https://wa.me/905308461934?text=Merhaba%2C%20nakliyat%20hizmeti%20i%C3%A7in%20teklif%20almak%20istiyorum.",
  email: "info@bgcnakliyat.com",
  address:
    "Mevlana, Çelebi Mehmet Cad. Marmara Park Alışveriş Merkezi No: 33A D:418, Esenyurt / İstanbul",
  hours: "Her gün 08:00 - 22:00",
  instagram: "https://www.instagram.com/bgc_nakliyat",
  googleMapsUrl: "https://maps.app.goo.gl/aGvSSsxvVjZCV2Dr5?g_st=iwb",
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=Bgc%20Nakliyat%20%7C%20Evden%20Eve%20Nakliyat%2C%20Mevlana%2C%20%C3%87elebi%20Mehmet%20Cad.%20Marmara%20Park%20Al%C4%B1%C5%9Fveri%C5%9F%20Merkezi%20No%3A%2033A%20D%3A418%2C%2034517%20Esenyurt%2F%C4%B0stanbul&output=embed",
};

export const navItems = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Bölgeler", href: "/bolgeler" },
  { label: "Blog", href: "/blog" },
  { label: "İletişim", href: "/iletisim" },
];

export const trustStats = [
  { value: "7/24", label: "Teklif ve planlama desteği" },
  { value: "08-22", label: "Her gün aktif operasyon" },
  { value: "%100", label: "Sigortalı taşıma yaklaşımı" },
  { value: "İstanbul", label: "Avrupa Yakası güçlü bölge ağı" },
];

export const services = [
  {
    title: "Evden Eve Nakliyat",
    slug: "evden-eve-nakliyat",
    icon: Truck,
    summary:
      "Eşya keşfinden yeni adrese yerleşime kadar taşınma sürecini planlı, güvenli ve hızlı şekilde yönetir.",
    details:
      "Profesyonel ekip, uygun araç seçimi, kat ve mesafe planlamasıyla İstanbul içi ev taşıma sürecini daha kontrollü hale getirir.",
  },
  {
    title: "Parça Eşya Taşıma",
    slug: "parca-esya-tasima",
    icon: Boxes,
    image: "/images/parca-esya-tasima.png",
    summary:
      "Tekli eşya, birkaç koli ya da küçük hacimli yükler için ekonomik ve pratik taşıma çözümü sunar.",
    details:
      "Küçük taşımalar için gereksiz maliyeti azaltan, hızlı randevu alınabilen esnek nakliyat hizmetidir.",
  },
  {
    title: "Ofis Eşyası Taşıma",
    slug: "ofis-esyasi-tasima",
    icon: Building2,
    image: "/images/ofis-tasima.png",
    summary:
      "Masa, dolap, teknoloji ekipmanı ve arşivlerin düzenli paketlenip yeni ofise taşınmasını sağlar.",
    details:
      "İş akışını minimum kesintiye uğratmak için operasyon saatleri, ekip sayısı ve taşıma sırası önceden planlanır.",
  },
  {
    title: "Asansörlü Taşıma",
    slug: "asansorlu-tasima",
    icon: Warehouse,
    image: "/images/asansorlu-tasima.png",
    summary:
      "Yüksek katlı binalarda dış cephe asansörüyle daha hızlı ve daha güvenli taşıma yapılmasına yardımcı olur.",
    details:
      "Bina merdiveni veya iç asansörün uygun olmadığı durumlarda eşya hasarı riskini azaltan etkili bir çözümdür.",
  },
  {
    title: "Şehirlerarası Nakliyat",
    slug: "sehirlerarasi-nakliyat",
    icon: MapPin,
    summary:
      "İstanbul çıkışlı şehirlerarası taşımalar için rota, paketleme ve teslimat sürecini uçtan uca planlar.",
    details:
      "Uzun mesafeli taşımalarda araç düzeni, sigorta ve teslim zamanlaması daha baştan netleştirilir.",
  },
  {
    title: "Paketleme ve Sigortalı Taşıma",
    slug: "paketleme-sigortali-tasima",
    icon: PackageCheck,
    image: "/images/paketleme-sigortali-tasima.png",
    summary:
      "Kırılacak, hassas ve değerli eşyalar için doğru ambalajlama ve sigortalı taşıma güveni sağlar.",
    details:
      "Eşyalar kategorisine göre paketlenir; taşıma süreci daha güvenli ve izlenebilir hale getirilir.",
  },
];

export const regions = [
  {
    name: "Esenyurt",
    title: "Esenyurt Evden Eve Nakliyat",
    description:
      "Marmara Park çevresi, site taşımaları ve yoğun apartman bölgeleri için hızlı keşif ve araç planlaması yapılır.",
  },
  {
    name: "Beylikdüzü",
    title: "Beylikdüzü Nakliyat",
    description:
      "Site yaşamının yoğun olduğu bölgelerde asansör, güvenlik girişi ve blok planı dikkate alınarak taşıma organize edilir.",
  },
  {
    name: "Avcılar",
    title: "Avcılar Evden Eve Nakliyat",
    description:
      "Dar sokak, kat durumu ve park alanı gibi detaylar önceden değerlendirilerek pratik taşıma süreci hazırlanır.",
  },
  {
    name: "İstanbul",
    title: "İstanbul İçi ve Şehirlerarası Nakliyat",
    description:
      "İstanbul Avrupa Yakası merkezli ekip, şehir içi ve Türkiye geneli taşımalarda planlı hizmet verir.",
  },
];

export const serviceDistricts = [
  "Adalar",
  "Arnavutköy",
  "Ataşehir",
  "Avcılar",
  "Bağcılar",
  "Bahçelievler",
  "Bakırköy",
  "Başakşehir",
  "Bayrampaşa",
  "Beşiktaş",
  "Beykoz",
  "Beylikdüzü",
  "Beyoğlu",
  "Büyükçekmece",
  "Çatalca",
  "Çekmeköy",
  "Esenler",
  "Esenyurt",
  "Eyüpsultan",
  "Fatih",
  "Gaziosmanpaşa",
  "Güngören",
  "Kadıköy",
  "Kağıthane",
  "Kartal",
  "Küçükçekmece",
  "Maltepe",
  "Pendik",
  "Sancaktepe",
  "Sarıyer",
  "Silivri",
  "Sultanbeyli",
  "Sultangazi",
  "Şile",
  "Şişli",
  "Tuzla",
  "Ümraniye",
  "Üsküdar",
  "Zeytinburnu",
];

export const faqItems = [
  {
    question: "İstanbul'da evden eve nakliyat fiyatları ne kadardır?",
    answer:
      "Fiyat; eşya miktarı, çıkış ve varış ilçesi, kat bilgisi, asansör kullanımı, paketleme ihtiyacı ve taşınma tarihine göre belirlenir. Net fiyat için WhatsApp üzerinden eşya bilgisi paylaşabilirsiniz.",
  },
  {
    question: "Nakliyat sırasında eşyalarım sigortalı mı?",
    answer:
      "Taşıma süreci sigortalı taşımacılık yaklaşımıyla planlanır. Kırılacak, hassas ve değerli eşyalar için paketleme ve taşıma sırası ayrıca değerlendirilir.",
  },
  {
    question: "Asansörlü taşıma hizmeti nedir ve ne zaman gereklidir?",
    answer:
      "Dış cephe taşıma asansörüyle eşyaların pencereden veya balkondan güvenli şekilde indirilip çıkarılmasıdır. Yüksek kat, dar merdiven, küçük bina asansörü veya ağır eşya durumlarında tercih edilir.",
  },
  {
    question: "Şehirlerarası nakliye hizmeti veriyor musunuz?",
    answer:
      "Evet. İstanbul çıkışlı şehirlerarası taşımalar için rota, araç planı, paketleme kapsamı ve teslimat zamanı önceden netleştirilir.",
  },
  {
    question: "Nakliyat için ne kadar önceden randevu almalıyım?",
    answer:
      "Mümkünse taşınma tarihinden birkaç gün önce iletişime geçmeniz önerilir. Yoğun dönemlerde ekip ve araç planı için daha erken randevu almak süreci kolaylaştırır.",
  },
  {
    question: "Hangi ilçelerde nakliyat hizmeti veriyorsunuz?",
    answer:
      "Esenyurt, Beylikdüzü, Avcılar başta olmak üzere İstanbul genelinde hizmet veriyoruz. Bölgeler sayfasındaki kayan ilçe şeridinden hizmet verilen ilçeleri inceleyebilirsiniz.",
  },
  {
    question: "Ofis taşımacılığı yapıyor musunuz?",
    answer:
      "Evet. Masa, dolap, teknoloji ekipmanı, arşiv ve koli taşımaları için ofis düzenine uygun ekip, araç ve taşıma sırası planlanır.",
  },
  {
    question: "Parça eşya taşıma hizmeti nedir?",
    answer:
      "Komple ev taşıma gerektirmeyen tekli eşya, birkaç koli veya küçük hacimli yüklerin ekonomik ve pratik şekilde taşınmasıdır.",
  },
];

export const featureItems = [
  { icon: ShieldCheck, title: "Sigortalı Taşıma", text: "Eşyalarınız için riskleri azaltan planlı ve güvenli operasyon." },
  { icon: BadgeCheck, title: "Ücretsiz Keşif", text: "Eşya, kat ve mesafe bilgisine göre net taşıma planı." },
  { icon: Clock, title: "Zamanında Hizmet", text: "Randevu saatine sadık, hızlı ve organize ekip çalışması." },
  { icon: Phone, title: "Hızlı İletişim", text: "Tek dokunuşla arama veya WhatsApp üzerinden teklif." },
];

export const googleReviews = [
  {
    author: "Murat K.",
    location: "Esenyurt",
    rating: 5,
    text: "Taşınma saatinde geldiler, paketleme düzenliydi. Eşyalar yeni eve sorunsuz ulaştı.",
  },
  {
    author: "Elif A.",
    location: "Beylikdüzü",
    rating: 5,
    text: "WhatsApp üzerinden hızlı teklif aldım. Ekip güler yüzlü ve oldukça dikkatli çalıştı.",
  },
  {
    author: "Serkan T.",
    location: "Avcılar",
    rating: 5,
    text: "Asansörlü taşıma sayesinde süreç beklediğimden kısa sürdü. Tavsiye ederim.",
  },
  {
    author: "Derya Y.",
    location: "İstanbul",
    rating: 5,
    text: "Ofis taşımamız planlı ilerledi. Kablolar, masalar ve koliler özenle ayrıldı.",
  },
  {
    author: "Can B.",
    location: "Esenyurt",
    rating: 5,
    text: "Parça eşya taşıma için ulaştım, aynı gün içinde hızlıca yardımcı oldular.",
  },
  {
    author: "Zeynep Ö.",
    location: "Beylikdüzü",
    rating: 5,
    text: "Fiyat ve süreç baştan net anlatıldı. Taşınma günü hiçbir aksama yaşamadık.",
  },
];

export const movingCompanySchema = {
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  name: company.name,
  alternateName: "BGC Nakliyat İstanbul",
  url: "https://www.bgcnakliyat.com",
  telephone: "+905308461934",
  email: company.email,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Mevlana, Çelebi Mehmet Cad. Marmara Park Alışveriş Merkezi No: 33A D:418",
    addressLocality: "Esenyurt",
    addressRegion: "İstanbul",
    postalCode: "34515",
    addressCountry: "TR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "22:00",
    },
  ],
  areaServed: regions.map((region) => ({
    "@type": "City",
    name: region.name,
  })),
  sameAs: [company.instagram, company.googleMapsUrl, "https://wa.me/905308461934"],
};
