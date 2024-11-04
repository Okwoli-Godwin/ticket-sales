'use client'

import { useState, useEffect } from 'react'
import { Button } from "./Components/ui/button"
import { Input } from "./Components/ui/input"
import { Label } from "./Components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./Components/ui/dialog"
import { Toast } from "./Components/ui/toast"
import { Toaster } from "./Components/ui/toaster"
import { useToast } from "./Components/ui/use-toast"
import { MapPin, Award, Utensils, Music, Check } from 'lucide-react'
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'
import img1 from "./assets/dinner.jpg"
import img2 from "./assets/gala.jpg"
import img3 from "./assets/vip.jpg"
import img4 from "./assets/night.jpg"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const CountdownTimer: React.FC = () => {
  const targetDate = new Date('2024-02-14T00:00:00').toISOString()

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date()
    const difference = new Date(targetDate).getTime() - now.getTime()

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const addLeadingZero = (value: number): string => (value < 10 ? `0${value}` : value.toString())

  return (
    <div className="flex space-x-4 text-2xl font-bold">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <span>{addLeadingZero(value)}</span>
          <span className="text-sm font-normal">{unit.charAt(0).toUpperCase() + unit.slice(1)}</span>
        </div>
      ))}
    </div>
  )
}

const App = () => {
  const [selectedTicket, setSelectedTicket] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const { toast } = useToast()

  const ticketTypes = [
    { id: 'regular', name: 'Individual Ticket', price: 5000, image: img1 },
    { id: 'couples', name: 'Couple\'s Package', price: 9000, image: img2 },
    { id: 'vvip', name: 'VIP Table (8 seats)', price: 15000, image: img3 },
    { id: 'vip', name: 'VIP Ticket', price: 10000, image: img4 },
  ]

  const config = {
    public_key: 'FLWPUBK_TEST-0f4a6722cc16d123de7d2141cd6567c6-X',
    tx_ref: Date.now().toString(),
    amount: ticketTypes.find(ticket => ticket.id === selectedTicket)?.price || 0,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: userEmail,
      phone_number: '070********',
      name: userName,
    },
    customizations: {
      title: 'Excellence Awards Dinner 2024',
      description: 'Payment for event tickets',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  }

  const handleFlutterPayment = useFlutterwave(config)

  const handleTicketSelection = (ticketId: string) => {
    setSelectedTicket(ticketId)
    setIsModalOpen(true)
  }

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName && userEmail) {
      setIsModalOpen(false)
      handlePayment()
    } else {
      toast({
        title: "Error",
        description: "Please enter both name and email",
        variant: "destructive",
      })
    }
  }

  const handlePayment = () => {
    if (!selectedTicket || !userName || !userEmail) {
      toast({
        title: "Error",
        description: "Please select a ticket and provide your information",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    handleFlutterPayment({
      callback: (response) => {
        console.log(response)
        closePaymentModal()
        if (response.status === "successful") {
          toast({
            title: "Payment Successful",
            description: `Your transaction ID is ${response.transaction_id}`,
          })
        } else {
          toast({
            title: "Payment Failed",
            description: "Please try again later",
            variant: "destructive",
          })
        }
        setIsProcessing(false)
      },
      onClose: () => {
        setIsProcessing(false)
      },
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-6 bg-black text-white">
        <div className="flex items-center space-x-2">
          <Award className="h-6 w-6" />
          <span className="text-2xl font-bold">Excellence Awards</span>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:text-gold transition-colors">Home</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">About</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Nominees</a></li>
            <li><a href="#" className="hover:text-gold transition-colors">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="relative h-[60vh] overflow-hidden">
          <img
            src="/placeholder.svg?height=1080&width=1920"
            alt="Elegant dinner setting"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Excellence Awards Dinner 2024</h1>
            <p className="text-xl mb-6">Celebrating Outstanding Achievements</p>
            <div className="flex flex-col items-center space-y-4">
              <CountdownTimer />
              <div className="flex items-center">
                <MapPin className="mr-2" />
                <span>Grand Ballroom, Lagos</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">An Evening of Elegance and Recognition</h2>
            <p className="text-lg text-gray-600">
              Join us for a night of celebration as we honor the brightest stars in our industry. 
              Enjoy a gourmet dinner, live entertainment, and witness the crowning of this year's excellence award winners.
            </p>
          </div>

          <div className="w-[70%] mt-[100px] mx-auto flex h-[450px] items-center justify-center gap-[10px]">
            {ticketTypes.map((ticket) => (
              <div
                key={ticket.id}
                className={`relative w-[10%] h-[100%] overflow-hidden rounded-[10px] border-4 transition-all duration-500 ease-in-out hover:w-[30%] cursor-pointer ${
                  selectedTicket === ticket.id ? 'border-gold shadow-lg shadow-gold/50' : 'border-transparent'
                }`}
                onClick={() => handleTicketSelection(ticket.id)}
              >
                <img
                  src={ticket.image}
                  alt={ticket.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    ₦{ticket.price.toLocaleString()}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-center">
                  <span className="text-sm">{ticket.name}</span>
                </div>
                {selectedTicket === ticket.id && (
                  <div className="absolute top-2 right-2 bg-gold rounded-full p-1">
                    <Check className="h-6 w-6 text-black" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 px-6 bg-black text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">What to Expect</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <Utensils className="h-12 w-12 mb-4 text-gold" />
                <h3 className="text-xl font-semibold mb-2">Gourmet Dinner</h3>
                <p>Savor a meticulously crafted 3-course meal prepared by top chefs.</p>
              </div>
              <div className="flex flex-col items-center">
                <Award className="h-12 w-12 mb-4 text-gold" />
                <h3 className="text-xl font-semibold mb-2">Awards Ceremony</h3>
                <p>Witness the recognition of outstanding achievements across multiple categories.</p>
              </div>
              <div className="flex flex-col items-center">
                <Music className="h-12 w-12 mb-4 text-gold" />
                <h3 className="text-xl font-semibold mb-2">Live Entertainment</h3>
                <p>Enjoy captivating performances throughout the evening.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-6 px-6 text-center">
        <p>&copy; 2024 Excellence Awards. All rights reserved.</p>
      </footer>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gold text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Enter Your Information</DialogTitle>
            <DialogDescription className="text-white">
              Please provide your name and email to proceed with the ticket purchase.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleModalSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right font-semibold">
                  Name
                </Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="col-span-3 bg-gold/20 border-black/20 text-black placeholder-black/50"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="col-span-3 bg-gold/20 border-black/20 text-black placeholder-black/50"
                  placeholder="Enter your email address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-black text-gold hover:bg-black/80">Proceed to Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

export default App