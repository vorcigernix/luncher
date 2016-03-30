'use strict'

var _ = require('lodash')
var zomato = require('../zomato')

module.exports = function () {
  var zo = zomato()

  var mapItem = function (item) {
    var title = _.trim(item.title)
    var amount = title.match(/\d+g/)
    amount = amount ? amount[0] : '1ks'
    return {
      item: title,
      price: _.trim(item.price),
      amount: amount
    }
  }

  var processMenu = function (next, date) {
    return function (err, res) {
      if (err) {
        console.error(err)
        return next(err)
      }
      var out = {}
      var currentDay = null
      var nextDay = null
      var menus = res.menus
      for (var i = 0; i < menus.length; i++) {
        var menu = menus[i]
        currentDay = zo.parseDate(_.trim(menu.day))
        if (date.isSame(currentDay) || (!nextDay && date.isBefore(currentDay))) {
          nextDay = currentDay
        }
        out[currentDay.format('YYYY-MM-DD')] = _.map(menu.items, mapItem)
      }

      setImmediate(function () {
        next(null, {menu: out, nextDay: nextDay ? nextDay.format('YYYY-MM-DD') : null})
      })
    }
  }

  var execute = zo.execute('https://www.zomato.com/cs/praha/peters-burger-pub-karl%C3%ADn-praha-8/menu', processMenu)

  return {
    execute: execute
  }
}