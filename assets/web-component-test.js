import { Component } from '@theme/component';

/** @typedef {{
 *   listItem: HTMLElement[];
 * }} Refs
 */

/** @extends {Component<Refs>} */

class WebComponentTest extends Component {
  connectedCallback() {
    super.connectedCallback();
    console.log('Connected');

    this.updateCount = this.updateCount.bind(this);
    document.addEventListener('shopify:cart:lines-update', this.updateCount);

    document.addEventListener('shopify:product:select', this.productSelected);
    this.productSelected = this.productSelected.bind(this);

    const listItems = this.refs.listItem;
    console.log(listItems);

    if (!listItems) return;

    listItems.forEach((listItem) => {
      console.log('element ' + listItem.textContent);
    });
  }

  /**
   * @param {Event} event
   */

  handleClick(event) {
    console.log('Clicked!');
  }

  get btnText() {
    return this.getAttribute('text');
  }

  sayHello() {
    console.log(this.btnText);
  }

  productSelected(product) {
    console.log(product);
    console.log(
      product.selectedOptions[0].name +
        ' ' +
        product.selectedOptions[0].value +
        ' sélectionné'
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    document.removeEventListener('shopify:cart:lines-update', this.updateCount);
  }

  /**
   * @param {Event} event
   */
  updateCount(event) {
    /** @type {Event & { promise?: Promise<{ cart: object }> }} */
    const cartEvent = event;

    cartEvent.promise?.then(({ cart }) => {
      console.log(cart);
      console.log(cart.cost.totalAmount.amount);
    });
  }
}

if (!customElements.get('web-component-test')) {
  customElements.define('web-component-test', WebComponentTest);
}

export default WebComponentTest;
