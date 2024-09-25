'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabaseClient'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

// Validation schema using Zod
const gigSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  type: z.enum(['project', 'bounty', 'grant'], { message: 'Please select a valid type.' }),
  deadline: z.string(),
  total_bounty: z.number().min(1, { message: 'Bounty must be at least 1.' }),
  bounty_breakdown: z
    .array(
      z.object({
        place: z.number().min(1, 'Place must be a positive number.'),
        amount: z.number().min(0, 'Amount must be 0 or greater.')
      })
    )
    .nonempty('At least one prize is required.'),
  skills_required: z.string()
})

// Define the type for the form data
type GigFormData = z.infer<typeof gigSchema>

export default function CreateGigPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const token = localStorage.getItem('sb-vldhwuxhpskjvcdbwrir-auth-token')
  let json: any
  if (token) {
    json = JSON.parse(token)
  }

  const businessId = json?.user?.id // Assuming json.user.id is a valid UUID
  const company = json?.user?.user_metadata?.display_name // Assuming company name is stored in user metadata

  if (!businessId || typeof businessId !== 'string') {
    setErrorMessage('Invalid business ID. Please log in again.')
    return null // Render nothing if business ID is invalid
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors }
  } = useForm<GigFormData>({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      bounty_breakdown: [{ place: 1, amount: 0 }] // Initialize with at least one prize
    }
  })

  const watchTotalBounty = watch('total_bounty', 0)

  const onSubmit = async (data: GigFormData) => {
    const totalBreakdownAmount = data.bounty_breakdown.reduce((acc, curr) => acc + curr.amount, 0)

    if (totalBreakdownAmount !== data.total_bounty) {
      setErrorMessage('Total breakdown amount must equal the total bounty.')
      return
    }

    try {
      const { data: gigData, error } = await supabase
        .from('gigs')
        .insert([
          {
            business: businessId,
            title: data.title,
            company: company, // Use the retrieved company from user metadata
            type: data.type,
            description: data.description,
            deadline: data.deadline,
            total_bounty: data.total_bounty,
            bounty_breakdown: data.bounty_breakdown,
            skills_required: data.skills_required
          }
        ])
        .select()

      if (error) throw error

      setSuccessMessage('Gig created successfully!')
      reset() // Reset the form after submission
    } catch (error: any) {
      setErrorMessage('Error creating gig: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-mono p-4">
      <div className="bg-white shadow-2xl rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Create Gig</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-2 text-black">Title:</label>
            <input
              type="text"
              {...register('title')}
              className="border border-black p-2 w-full bg-white text-black"
              placeholder="Enter gig title"
            />
            {errors.title && <p className="text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-black">Description:</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <ReactQuill
                  {...field}
                  theme="snow"
                  placeholder="Enter gig description"
                  className="bg-white text-black border-black"
                />
              )}
            />
            {errors.description && <p className="text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block mb-2 text-black">Type:</label>
            <select
              {...register('type')}
              className="border border-black p-2 w-full bg-white text-black"
            >
              <option value="">Select gig type</option>
              <option value="project">Project</option>
              <option value="bounty">Bounty</option>
              <option value="grant">Grant</option>
            </select>
            {errors.type && <p className="text-red-500 mt-1">{errors.type.message}</p>}
          </div>

          {/* Deadline */}
          <div>
            <label className="block mb-2 text-black">Deadline:</label>
            <input
              type="date"
              {...register('deadline')}
              className="border border-black p-2 w-full bg-white text-black"
            />
            {errors.deadline && <p className="text-red-500 mt-1">{errors.deadline.message}</p>}
          </div>

          {/* Total Bounty */}
          <div>
            <label className="block mb-2 text-black">Total Bounty:</label>
            <input
              type="number"
              {...register('total_bounty', { valueAsNumber: true })}
              className="border border-black p-2 w-full bg-white text-black"
            />
            {errors.total_bounty && <p className="text-red-500 mt-1">{errors.total_bounty.message}</p>}
          </div>

          {/* Bounty Breakdown */}
          <div>
            <label className="block mb-2 text-black">Bounty Breakdown:</label>
            <div className="space-y-2">
              <Controller
                name="bounty_breakdown"
                control={control}
                render={({ field }) => (
                  <>
                    {field.value?.map((item, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <div className="flex-grow">
                          <label className="text-black">Place {index + 1}:</label>
                          <input type="hidden" value={index + 1} />
                        </div>
                        <div className="flex-grow">
                          <label className="text-black">Amount:</label>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => {
                              const updated = [...field.value]
                              updated[index].amount = Number(e.target.value)
                              field.onChange(updated)
                            }}
                            className="border border-black p-2 w-full bg-white text-black"
                            placeholder="Enter prize amount"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = field.value.filter((_, i) => i !== index)
                            field.onChange(updated)
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => field.onChange([...(field.value || []), { place: field.value.length + 1, amount: 0 }])}
                      className="text-black border border-black px-4 py-2 hover:bg-gray-100"
                    >
                      Add Prize
                    </button>
                  </>
                )}
              />
            </div>
            {errors.bounty_breakdown && <p className="text-red-500 mt-1">{errors.bounty_breakdown.message}</p>}
          </div>

          {/* Skills Required */}
          <div>
            <label className="block mb-2 text-black">Skills Required:</label>
            <input
              type="text"
              {...register('skills_required')}
              className="border border-black p-2 w-full bg-white text-black"
              placeholder="e.g., JavaScript, React, CSS"
            />
            {errors.skills_required && <p className="text-red-500 mt-1">{errors.skills_required.message}</p>}
          </div>

          <button type="submit" className="w-full bg-black text-white py-2 px-4 hover:bg-gray-800">
            Create Gig
          </button>

          {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
          {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
        </form>
      </div>
    </div>
  )
}
