export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  image: { uri: string };
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  discount: string;
  image: { uri: string };
  badge?: string;
}

export let servicesData: Service[] = [
  {
    id: "1",
    name: "Haircut & Styling",
    description: "Classic, layered, or modern styles — your look, perfected.",
    price: "₱250 - ₱400",
    image: {
      uri: "https://img.freepik.com/premium-photo/female-client-receiving-haircut-beauty-salon-young-woman-enjoying-getting-new-hairstyle_141172-7333.jpg",
    },
  },
  {
    id: "2",
    name: "Hair Color",
    description: "Vibrant shades and subtle tones for all hair types.",
    price: "₱800 - ₱1,500",
    image: {
      uri: "https://img1.wsimg.com/isteam/ip/10ce9f98-419e-47a5-bf54-acfaaf041f34/Why%20Do%20Salons%20Wash%20Your%20Hair%20After%20Coloring.jpeg",
    },
  },
  {
    id: "3",
    name: "Rebond & Treatment",
    description: "Smooth, shiny, and frizz-free hair with long-lasting results.",
    price: "₱1,200 - ₱2,500",
    image: {
      uri: "https://i0.wp.com/post.healthline.com/wp-content/uploads/2020/07/hair-salon-straight-1296x728-header.jpg?w=1155&h=1528",
    },
  },
  {
    id: "4",
    name: "Nail Care",
    description: "Pamper yourself with manicure, pedicure, and nail art.",
    price: "₱300 - ₱600",
    image: {
      uri: "https://michmylnails.net/wp-content/uploads/2022/08/Nail-Salon-Slider-Banner.jpg",
    },
  },
  {
    id: "5",
    name: "Makeup & Glam",
    description: "For special occasions — look flawless and confident.",
    price: "₱800 - ₱2,000",
    image: {
      uri: "https://images.fresha.com/lead-images/placeholders/beauty-salon-66.jpg?class=venue-gallery-large",
    },
  },
];

export let promoDeals: Promo[] = [
  {
    id: "1",
    title: "30% Off Hair Rebond",
    description: "Get silky, straight hair with our best-selling treatment!",
    discount: "₱1,750 → ₱1,225",
    badge: "HOT DEAL",
    image: {
      uri: "https://cdn.shopify.com/s/files/1/1412/4580/files/Keratin_vs_Rebond_Salon_480x480.jpg?v=1686244964",
    },
  },
  {
    id: "2",
    title: "Free Manicure with Haircut",
    description: "Book any haircut and get a free manicure session.",
    discount: "Save ₱250",
    badge: "BUNDLE",
    image: {
      uri: "https://michmylnails.net/wp-content/uploads/2022/08/Nail-Salon-Slider-Banner.jpg",
    },
  },
  {
    id: "3",
    title: "Holiday Glow Makeup",
    description: "Perfect your festive look with a 25% off on all makeup sessions.",
    discount: "₱2,000 → ₱1,500",
    badge: "LIMITED",
    image: {
      uri: "https://images.fresha.com/lead-images/placeholders/beauty-salon-66.jpg?class=venue-gallery-large",
    },
  },
  {
    id: "5",
    title: "Hair Color Treatment",
    description: "Full color treatment with free hair mask and styling!",
    discount: "₱1,200 → ₱850",
    badge: "NEW",
    image: {
      uri: "https://img1.wsimg.com/isteam/ip/10ce9f98-419e-47a5-bf54-acfaaf041f34/Why%20Do%20Salons%20Wash%20Your%20Hair%20After%20Coloring.jpeg",
    },
  },
  {
    id: "6",
    title: "Weekend Relax Package",
    description: "Hair spa, scalp massage, and deep conditioning treatment.",
    discount: "₱1,800 → ₱1,200",
    badge: "WEEKENDS",
    image: {
      uri: "https://media.istockphoto.com/id/500135894/photo/clients-hair-is-being-reconditioned.jpg?s=612x612&w=0&k=20&c=Vy_EE5oGrMn_YWiJ8V27sOB0HdwAie_QqdnEJtWV1F0=",
    },
  },
  {
    id: "7",
    title: "Student Special Cut",
    description: "Show your student ID and get 40% off any haircut service!",
    discount: "From ₱250 → ₱150",
    badge: "STUDENT",
    image: {
      uri: "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?auto=format&fit=crop&w=800&q=80",
    },
  },
];

// Helper functions to manage services
export const addService = (service: Omit<Service, "id">) => {
  const newId = (Math.max(...servicesData.map((s) => parseInt(s.id))) + 1).toString();
  const newService = { ...service, id: newId };
  servicesData.push(newService);
  return newService;
};

export const updateService = (id: string, updates: Partial<Omit<Service, "id">>) => {
  const index = servicesData.findIndex((s) => s.id === id);
  if (index !== -1) {
    servicesData[index] = { ...servicesData[index], ...updates };
    return servicesData[index];
  }
  return null;
};

export const deleteService = (id: string) => {
  const index = servicesData.findIndex((s) => s.id === id);
  if (index !== -1) {
    servicesData.splice(index, 1);
    return true;
  }
  return false;
};

export const getServices = () => [...servicesData];
export const getPromos = () => [...promoDeals];
