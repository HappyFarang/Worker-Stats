import * as React from "react"
import PropTypes from 'prop-types'

const Card = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-white shadow-sm ${className}`}
    {...props}
  />
))
Card.displayName = "Card"
Card.propTypes = {
  className: PropTypes.string
}

const CardHeader = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"
CardHeader.propTypes = {
  className: PropTypes.string
}

const CardTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"
CardTitle.propTypes = {
  className: PropTypes.string
}

const CardContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
))
CardContent.displayName = "CardContent"
CardContent.propTypes = {
  className: PropTypes.string
}

export { Card, CardHeader, CardTitle, CardContent }