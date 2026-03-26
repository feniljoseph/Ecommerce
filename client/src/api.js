import axios from "axios";

// Mock data for products
const mockProducts = [
  {
    _id: "1",
    title: "Classic White Shirt",
    price: 49.99,
    category: "Men",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    _id: "2",
    title: "Denim Jacket",
    price: 89.99,
    category: "Men",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    _id: "3",
    title: "Floral Summer Dress",
    price: 59.99,
    category: "Women",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
    sizes: ["S", "M", "L"],
  },
  {
    _id: "4",
    title: "Leather Handbag",
    price: 129.99,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
    sizes: ["One Size"],
  },
  {
    _id: "5",
    title: "Kids Combo Pack",
    price: 39.99,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=400",
    sizes: ["S", "M", "L"],
  },
  {
    _id: "6",
    title: "Winter Woolen Coat",
    price: 199.99,
    category: "Winter Wear",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    _id: "7",
    title: "Casual Blue Jeans",
    price: 69.99,
    category: "Men",
    image: "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    _id: "8",
    title: "Elegant Evening Gown",
    price: 149.99,
    category: "Women",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400",
    sizes: ["S", "M", "L"],
  },
];

// API base URL - can be configured for backend
const API_BASE_URL = "https://ecommerce-backend-psi-five.vercel.app/api";
const STORAGE_KEYS = {
  CART: "krist-app-cart",
  FAVOURITE: "krist-app-favourite",
  ORDERS: "krist-app-orders",
};

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getPriceNumber = (product) => {
  const value = product?.price?.org ?? product?.price ?? 0;
  return Number(value) || 0;
};

const toCartProduct = (product) => ({
  ...product,
  _id: product?._id || product?.id,
  name: product?.name || product?.title,
  img: product?.img || product?.image,
  price: {
    org: getPriceNumber(product),
  },
});

const toCatalogProduct = (product) => ({
  ...product,
  _id: product?._id || product?.id,
  title: product?.title || product?.name || "Product",
  image: product?.image || product?.img,
  price: getPriceNumber(product),
});

const toProductDetails = (product) => {
  if (!product) return product;
  const org = getPriceNumber(product);
  const mrp = Number((org * 1.25).toFixed(2));
  const off = Math.round(((mrp - org) / mrp) * 100);
  return {
    ...product,
    _id: product?._id || product?.id,
    sizes: Array.isArray(product?.sizes) ? product.sizes : [],
    name: product?.name || product?.title,
    img: product?.img || product?.image,
    desc:
      product?.desc ||
      "Premium quality product crafted for everyday comfort and style.",
    price:
      typeof product?.price === "object"
        ? product.price
        : { org, mrp, off },
  };
};

const findProductById = (id) =>
  mockProducts.find((product) => String(product._id) === String(id));

const getStoredItemId = (item) =>
  item?.productId ||
  item?.productID ||
  item?._id ||
  item?.id ||
  item?.product?._id ||
  item?.product?.id;

// Mock function to simulate API call
const getMockProducts = (query = "") => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredProducts = [...mockProducts];
      
      // Parse query string for filtering
      if (query) {
        const params = new URLSearchParams(query);
        
        const minPrice = params.get("minPrice");
        const maxPrice = params.get("maxPrice");
        const sizes = params.get("sizes");
        const categories = params.get("categories");
        
        if (minPrice) {
          filteredProducts = filteredProducts.filter(
            (p) => p.price >= parseFloat(minPrice)
          );
        }
        if (maxPrice) {
          filteredProducts = filteredProducts.filter(
            (p) => p.price <= parseFloat(maxPrice)
          );
        }
        if (sizes) {
          const sizeArray = sizes.split(",");
          filteredProducts = filteredProducts.filter((p) =>
            p.sizes.some((s) => sizeArray.includes(s))
          );
        }
        if (categories) {
          const categoryArray = categories.split(",");
          filteredProducts = filteredProducts.filter((p) =>
            categoryArray.includes(p.category)
          );
        }
      }
      
      resolve({ data: filteredProducts });
    }, 500); // Simulate network delay
  });
};

export const getAllProducts = async (query = "") => {
  try {
    // Try to make actual API call to backend
    const response = await axios.get(`${API_BASE_URL}/products?${query}`);
    const raw = Array.isArray(response?.data) ? response.data : response?.data?.data;
    const data = Array.isArray(raw) ? raw.map(toCatalogProduct) : [];
    return { data };
  } catch (error) {
    // If backend is not available, use mock data
    console.log("Using mock data (backend not available)");
    const fallback = await getMockProducts(query);
    return { data: (fallback?.data || []).map(toCatalogProduct) };
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    const data = response?.data?.data || response?.data;
    return { data };
  } catch (error) {
    // Return mock product if not found
    const product = mockProducts.find((p) => p._id === id);
    return { data: product };
  }
};

export const getProductDetails = async (id) => {
  const res = await getProductById(id);
  return { data: toProductDetails(res?.data) };
};

export const getFavourite = async () => {
  const favouriteItems = readJson(
    STORAGE_KEYS.FAVOURITE,
    mockProducts.slice(0, 4).map((product) => product._id)
  );
  const data = favouriteItems
    .map((entry) => {
      if (typeof entry === "string" || typeof entry === "number") {
        return findProductById(entry);
      }
      if (entry?.product) return toCatalogProduct(entry.product);
      if (entry?.productId) {
        const fromMock = findProductById(entry.productId);
        return fromMock || toCatalogProduct(entry);
      }
      return null;
    })
    .filter(Boolean)
    .map(toCatalogProduct);
  return { data };
};

export const addToFavourite = async (_token, payload) => {
  const productId =
    payload?.productID ||
    payload?.productId ||
    payload?.product?._id ||
    payload?.product?.id;
  if (!productId) return { data: { success: false } };

  const favourite = readJson(STORAGE_KEYS.FAVOURITE, []);
  const exists = favourite.some((entry) =>
    String(
      typeof entry === "object"
        ? entry?.productId || entry?.productID || entry?._id || entry?.id
        : entry
    ) === String(productId)
  );
  if (!exists) {
    favourite.push({
      productId,
      product: payload?.product || null,
    });
    writeJson(STORAGE_KEYS.FAVOURITE, favourite);
  }
  return { data: { success: true } };
};

export const deleteFromFavourite = async (_token, payload) => {
  const productId =
    payload?.productID ||
    payload?.productId ||
    payload?.product?._id ||
    payload?.product?.id;
  const favourite = readJson(STORAGE_KEYS.FAVOURITE, []);
  const updated = favourite.filter((entry) => {
    const entryId =
      typeof entry === "object" ? entry?.productId || entry?._id || entry?.id : entry;
    return String(entryId) !== String(productId);
  });
  writeJson(STORAGE_KEYS.FAVOURITE, updated);
  return { data: { success: true } };
};

export const getCart = async () => {
  const cart = readJson(STORAGE_KEYS.CART, []);
  const data = cart
    .map((item) => {
      const itemId = getStoredItemId(item);
      const product = findProductById(itemId) || item.product;
      if (!product) return null;
      return {
        _id: itemId,
        quantity: Number(item?.quantity) > 0 ? Number(item.quantity) : 1,
        product: toCartProduct(product),
      };
    })
    .filter(Boolean);
  return { data };
};

export const addToCart = async (_token, payload) => {
  const { quantity = 1, product = null } = payload || {};
  const productId =
    payload?.productId || payload?.product?._id || payload?.product?.id;
  if (!productId) {
    throw new Error("Product ID is missing for cart item.");
  }

  const cart = readJson(STORAGE_KEYS.CART, []);
  const existing = cart.find(
    (item) => String(getStoredItemId(item)) === String(productId)
  );
  if (existing) {
    existing.quantity += quantity;
    if (product) existing.product = product;
  } else {
    cart.push({ productId, quantity, product });
  }
  writeJson(STORAGE_KEYS.CART, cart);
  return { data: { success: true } };
};

export const deleteFromCart = async (_token, payload) => {
  const { productId, quantity } = payload || {};
  let cart = readJson(STORAGE_KEYS.CART, []);
  const index = cart.findIndex(
    (item) => String(getStoredItemId(item)) === String(productId)
  );
  if (index === -1) return { data: { success: true } };

  if (quantity == null) {
    cart.splice(index, 1);
  } else {
    const nextQty = cart[index].quantity - quantity;
    if (nextQty <= 0) cart.splice(index, 1);
    else cart[index].quantity = nextQty;
  }

  writeJson(STORAGE_KEYS.CART, cart);
  return { data: { success: true } };
};

export const placeOrder = async (_token, orderDetails) => {
  const orders = readJson(STORAGE_KEYS.ORDERS, []);
  orders.push({
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...orderDetails,
  });
  writeJson(STORAGE_KEYS.ORDERS, orders);
  writeJson(STORAGE_KEYS.CART, []);
  return { data: { success: true } };
};

// User Authentication
const AUTH_KEY = "krist-app-user";

export const UserSignUp = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/signup`, data);
    if (response.data?.token) {
      localStorage.setItem("krist-app-token", response.data.token);
      localStorage.setItem(AUTH_KEY, JSON.stringify(response.data));
    }
    return { data: response.data };
  } catch (error) {
    // For mock mode, create a mock user
    const mockUser = {
      _id: Date.now().toString(),
      name: data.name,
      email: data.email,
      token: "mock-token-" + Date.now(),
    };
    localStorage.setItem("krist-app-token", mockUser.token);
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    return { data: mockUser };
  }
};

export const UserSignIn = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user/signin`, data);
    if (response.data?.token) {
      localStorage.setItem("krist-app-token", response.data.token);
      localStorage.setItem(AUTH_KEY, JSON.stringify(response.data));
    }
    return { data: response.data };
  } catch (error) {
    // For mock mode, check if user exists in localStorage
    const storedUser = localStorage.getItem(AUTH_KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === data.email) {
        return { data: user };
      }
    }
    throw new Error("Invalid credentials");
  }
};

const api = {
  getAllProducts,
  getProductById,
  getProductDetails,
  getFavourite,
  addToFavourite,
  deleteFromFavourite,
  getCart,
  addToCart,
  deleteFromCart,
  placeOrder,
  UserSignUp,
  UserSignIn,
};

export default api;
