/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  const rec = {
    width,
    height,
    getArea() {
      return width * height;
    },
  };
  return rec;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const objJSON = JSON.parse(json);
  Object.setPrototypeOf(objJSON, proto);
  return objJSON;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const OneTimeInsideError = 'Element, id and pseudo-element should not occur more then one time inside the selector';
const FollowingOrderError = 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element';

class Builder {
  constructor(value) {
    this.value1 = '';
    if (arguments.length > 0) {
      this.value1 = value;
    }
  }

  stringify() {
    return this.value1;
  }

  element(value) {
    if (this.elementExist) {
      throw new Error(OneTimeInsideError);
    }

    if (this.idExist || this.classExist || this.attrExist || this.pseudoClassExist
      || this.pseudoElementExist) {
      throw new Error(FollowingOrderError);
    }

    this.elementExist = true;
    this.value1 += value;
    return this;
  }

  id(value) {
    if (this.idExist) {
      throw new Error(OneTimeInsideError);
    }

    if (this.classExist || this.attrExist || this.pseudoClassExist || this.pseudoElementExist) {
      throw new Error(FollowingOrderError);
    }

    this.idExist = true;
    this.value1 += '#';
    this.value1 += value;
    return this;
  }

  class(value) {
    if (this.attrExist || this.pseudoClassExist || this.pseudoElementExist) {
      throw new Error(FollowingOrderError);
    }

    this.classExist = true;
    this.value1 += '.';
    this.value1 += value;
    return this;
  }

  attr(value) {
    if (this.pseudoClassExist || this.pseudoElementExist) {
      throw new Error(FollowingOrderError);
    }

    this.attrExist = true;
    this.value1 += '[';
    this.value1 += value;
    this.value1 += ']';
    return this;
  }

  pseudoClass(value) {
    if (this.pseudoElementExist) {
      throw new Error(FollowingOrderError);
    }

    this.pseudoClassExist = true;
    this.value1 += ':';
    this.value1 += value;
    return this;
  }

  pseudoElement(value) {
    if (this.pseudoElementExist) {
      throw new Error(OneTimeInsideError);
    }

    this.pseudoElementExist = true;
    this.value1 += '::';
    this.value1 += value;
    return this;
  }

  combine(selector1, combinator, selector2) {
    this.value1 += selector1.stringify();
    this.value1 += ' ';
    this.value1 += combinator;
    this.value1 += ' ';
    this.value1 += selector2.stringify();
    return this;
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new Builder().element(value);
  },

  id(value) {
    return new Builder().id(value);
  },

  class(value) {
    return new Builder().class(value);
  },

  attr(value) {
    return new Builder().attr(value);
  },

  pseudoClass(value) {
    return new Builder().pseudoClass(value);
  },

  pseudoElement(value) {
    return new Builder().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new Builder().combine(selector1, combinator, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
