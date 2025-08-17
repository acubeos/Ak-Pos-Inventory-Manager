import sale from '../assets/icons/outstanding-icon.png'
import customer from '../assets/icons/customer-icon.png'
import Outstanding from '../assets/icons/sale-icon.png'

interface Cards {
  title: string
  value: string | number
  icon?: string
  badge?: string
}

const Cards = (): React.JSX.Element => {
  return (
    <div className="flex flex-wrap gap-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className="flex flex-col justify-center border bg-white rounded-lg w-52 h-32 p-3"
        >
          <h2 className="font-bold">{card.title}</h2>
          <div className="flex flex-row gap-x-4">
            <p className="font-semibold">{card.value}</p>
            {card.badge && <button className="btn btn-xs badge-secondary">{card.badge}</button>}
            {card.icon && (
              <div className="rounded-full overflow-hidden w-6 bg-slate-200">
                <img src={card.icon} alt="icon1" className="object-contain" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const cards: Cards[] = [
  {
    title: 'Daily Sale',
    value: '#1,000,000',
    icon: sale
  },
  {
    title: 'Customers',
    value: '200',
    icon: customer
  },
  {
    title: 'Outstanding',
    value: '400,000',
    icon: Outstanding
  },
  {
    title: 'Product Details',
    value: 'Product Count',
    badge: '6'
  }
]

export default Cards
