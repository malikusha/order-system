const { checkSchema, validationResult } = require('express-validator')

const orderValidationRules = () => {
    return checkSchema({
        'order_info.paymentInfo.name': {
            isLength: {
                options: {min: 1, max: 1200}
            }
        },
        'order_info.paymentInfo.cardNumber': {
            isLength: {
                options: {min: 16, max: 16}
            },
            toInt: true,
            isInt: true
        },
        'order_info.paymentInfo.month': {
            isLength: {
                options: {min: 2, max: 2}
            },
            toInt: true,
            isInt: {
                options: {min: 1, max: 12}
            }
        },
        'order_info.paymentInfo.year': {
            isLength: {
                options: {min: 2, max: 2}
            },
            toInt: true,
            isInt: {
                options: {min: 23}
            }
        },
        'order_info.paymentInfo.code': {
            isLength: {
                options: {min: 3, max: 3}
            },
            toInt: true,
            isInt: true
        },
        'order_info.paymentInfo.address': {
            isLength: {
                options: {min: 1, max: 3000}
            }
        },
        'order_info.paymentInfo.state': {
            isLength: {
                options: {min: 1, max: 50}
            }
        },
        'order_info.paymentInfo.zip': {
            isPostalCode: {
                options: 'US'
            }
        },
        'order_info.orderTotal': {
            isFloat: true,
            toFloat: true
        },
        'order_info.items.*.item_id': {
            isInt: {
                options: {min: 1, max: 11}
            }
        },
        'order_info.items.*.count': {
            isInt: true,
            toInt: true
        }

    })
}

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors,
  })
}

module.exports = {
    orderValidationRules,
    validate,
}