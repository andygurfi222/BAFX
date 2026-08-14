import { z } from "zod";
import { DELIVERY_METHODS, PAYMENT_METHODS } from "@/lib/constants";

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "Ingresá tu nombre"),
  lastName: z.string().trim().min(1, "Ingresá tu apellido"),
  email: z.string().trim().email("Ingresá un email válido"),
  phone: z.string().trim().min(6, "Ingresá un teléfono válido"),
  dni: z.string().trim().optional(),
  deliveryMethod: z.enum(DELIVERY_METHODS),
  paymentMethod: z.enum(PAYMENT_METHODS),
  shippingAddress: z.string().trim().optional(),
  shippingCity: z.string().trim().optional(),
  shippingZip: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "El carrito está vacío"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  description: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  price: z.coerce.number().int().min(0, "El precio no puede ser negativo"),
  compareAtPrice: z.coerce.number().int().min(0).optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().min(1, "Elegí una categoría"),
  featured: z.coerce.boolean().default(false),
  onSale: z.coerce.boolean().default(false),
  status: z.enum(["active", "inactive", "draft"]).default("active"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  description: z.string().trim().optional(),
  parentId: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
  active: z.coerce.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  whatsapp: z.string().trim().min(1),
  address: z.string().trim().min(1),
  city: z.string().trim().min(1),
  hours: z.string().trim().min(1),
  instagram: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
  shippingInfo: z.string().trim().optional(),
  pickupInfo: z.string().trim().optional(),
  aboutText: z.string().trim().optional(),
});
