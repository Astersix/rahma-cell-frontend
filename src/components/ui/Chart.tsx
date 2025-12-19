import * as React from 'react'
import { cn } from '../../utils/cn'

const Chart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('', className)}
    {...props}
  />
))
Chart.displayName = 'Chart'

export { Chart }
