/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface OrderItem {
  name: string
  quantity: number
  price: number
  size?: string
}

interface OrderConfirmationEmailProps {
  customerName: string
  orderId: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  district: string
  address: string
  paymentMethod: 'cod' | 'orange_money'
}

function formatPrice(amount: number): string {
  return `Le ${amount.toLocaleString('en-US')}`
}

export const OrderConfirmationEmail = ({
  customerName,
  orderId,
  items = [],
  subtotal,
  deliveryFee,
  total,
  district,
  address,
  paymentMethod,
}: OrderConfirmationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your SaloneMakitSL order #{orderId?.slice(0, 8).toUpperCase()} is confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://tjcmmopmmoiokomuzcqe.supabase.co/storage/v1/object/public/email-assets/logo.png"
          alt="SaloneMakitSL"
          width="140"
          height="auto"
          style={{ margin: '0 0 24px' }}
        />
        <Heading style={h1}>Order Confirmed! 🎉</Heading>
        <Text style={text}>
          Hey {customerName}, thanks for your order! We're getting it ready for you.
        </Text>

        <Section style={orderIdBox}>
          <Text style={orderIdLabel}>Order ID</Text>
          <Text style={orderIdValue}>#{orderId?.slice(0, 8).toUpperCase()}</Text>
        </Section>

        {/* Items */}
        <Section style={sectionBox}>
          <Text style={sectionTitle}>Items Ordered</Text>
          {items.map((item, i) => (
            <Section key={i} style={itemRow}>
              <Text style={itemName}>
                {item.name} × {item.quantity}
                {item.size ? ` (${item.size})` : ''}
              </Text>
              <Text style={itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </Section>
          ))}
        </Section>

        <Hr style={divider} />

        {/* Totals */}
        <Section style={totalsSection}>
          <Section style={totalRow}>
            <Text style={totalLabel}>Subtotal</Text>
            <Text style={totalValue}>{formatPrice(subtotal)}</Text>
          </Section>
          <Section style={totalRow}>
            <Text style={totalLabel}>Delivery</Text>
            <Text style={totalValue}>{formatPrice(deliveryFee)}</Text>
          </Section>
          <Hr style={divider} />
          <Section style={totalRow}>
            <Text style={grandTotalLabel}>Total</Text>
            <Text style={grandTotalValue}>{formatPrice(total)}</Text>
          </Section>
        </Section>

        <Hr style={divider} />

        {/* Delivery */}
        <Section style={sectionBox}>
          <Text style={sectionTitle}>📍 Delivery Details</Text>
          <Text style={text}>{address}, {district}</Text>
        </Section>

        {/* Payment */}
        <Section style={sectionBox}>
          <Text style={sectionTitle}>💳 Payment</Text>
          <Text style={text}>
            {paymentMethod === 'orange_money'
              ? `Orange Money — Please send ${formatPrice(total)} to +232 78 928 111`
              : `Cash on Delivery — Pay ${formatPrice(total)} when you receive your order`}
          </Text>
        </Section>

        <Text style={footer}>
          Questions? Reply to this email or WhatsApp us at +232 78 928 111.
        </Text>
        <Text style={footer}>
          © SaloneMakitSL — Sierra Leone's Online Store
        </Text>
      </Container>
    </Body>
  </Html>
)

export default OrderConfirmationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', 'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(213, 65%, 25%)',
  margin: '0 0 16px',
}
const text = {
  fontSize: '14px',
  color: 'hsl(215, 10%, 50%)',
  lineHeight: '1.5',
  margin: '0 0 8px',
}
const orderIdBox = {
  backgroundColor: 'hsl(152, 55%, 95%)',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '0 0 20px',
}
const orderIdLabel = { fontSize: '11px', color: 'hsl(215, 10%, 50%)', margin: '0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const orderIdValue = { fontSize: '18px', fontWeight: 'bold' as const, color: 'hsl(152, 55%, 33%)', margin: '4px 0 0' }
const sectionBox = { margin: '0 0 16px' }
const sectionTitle = { fontSize: '13px', fontWeight: 'bold' as const, color: 'hsl(213, 65%, 25%)', margin: '0 0 8px' }
const itemRow = { display: 'flex' as const, justifyContent: 'space-between' as const, margin: '0 0 4px' }
const itemName = { fontSize: '13px', color: 'hsl(215, 10%, 40%)', margin: '0', flex: '1' as const }
const itemPrice = { fontSize: '13px', fontWeight: '600' as const, color: 'hsl(213, 65%, 25%)', margin: '0', textAlign: 'right' as const }
const divider = { borderColor: '#e5e7eb', margin: '16px 0' }
const totalsSection = { margin: '0 0 8px' }
const totalRow = { display: 'flex' as const, justifyContent: 'space-between' as const, margin: '0 0 4px' }
const totalLabel = { fontSize: '13px', color: 'hsl(215, 10%, 50%)', margin: '0' }
const totalValue = { fontSize: '13px', color: 'hsl(213, 65%, 25%)', margin: '0', textAlign: 'right' as const }
const grandTotalLabel = { fontSize: '14px', fontWeight: 'bold' as const, color: 'hsl(213, 65%, 25%)', margin: '0' }
const grandTotalValue = { fontSize: '16px', fontWeight: 'bold' as const, color: 'hsl(152, 55%, 33%)', margin: '0', textAlign: 'right' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0', textAlign: 'center' as const }
