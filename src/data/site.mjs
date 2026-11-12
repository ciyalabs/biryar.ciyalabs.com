/**
 * What is switched on for this site. Two things, and both are off until
 * the value is filled in. Nothing here is a secret: each value ends up in
 * the page for anyone to read.
 *
 * Filling one in changes three places at once, which is why they live in
 * one file: the page that uses it, the privacy notice (which only
 * describes what is actually on), and the footer.
 */

/**
 * The pay buttons on Get Biryar.
 *
 * Each is the public address of a Stripe payment link, as Stripe shows it
 * when the link is made: https://buy.stripe.com/... One for a month of
 * Pro, one for a year, each a one-off payment. With both empty, the page
 * offers the invoice and bank transfer by email, as it always has.
 */
export const BUY = {
  month: '',
  year: '',
};

/**
 * The visitor counter.
 *
 * The site's code at GoatCounter: the first part of the address the
 * account is given. For https://biryar.goatcounter.com it is 'biryar'.
 * Empty, no counter is loaded and the site makes no request to anyone
 * but its own host.
 */
export const GOATCOUNTER = 'biryar';

export const buying = Boolean(BUY.month || BUY.year);
export const counting = Boolean(GOATCOUNTER);
