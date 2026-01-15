# Template Variables Guide

This guide details the variables available for use in HTML templates (e.g., `invoice.html`, `quote.html`). These variables are passed to the template engine (Handlebars) when generating PDFs.

## Common Root Variables (Invoice & Quote)

These variables are available at the root level of your template.

| Variable | Type | Description |
| :--- | :--- | :--- |
| `number` | String | The unique document number (e.g., "INV-001"). |
| `date` | String | Creation date, formatted as a local date string. |
| `dueDate` | String | Due/Expiration date, formatted as a local date string (or null). |
| `status` | String | Current status (e.g., "DRAFT", "SENT", "PAID"). |
| `total` | String | Total amount, formatted with 2 decimal places. |
| `currency` | String | Currency code (e.g., "EUR"). |
| `notes` | String | Optional notes/comments added to the document. |
| `client` | Object | The client details object (see below). |
| `items` | Array | List of items/products (see below). |

## Invoice-Specific Variables

These variables are only available when generating an Invoice PDF.

### General
| Variable | Type | Description |
| :--- | :--- | :--- |
| `isRecurring` | Boolean | True if this is a recurring invoice. |
| `recurringInterval`| String | Interval for recurring invoices (e.g., "MONTHLY") if applicable. |

### Retainer Invoices
These variables are populated if the invoice is a **Retainer Invoice** (`isRetainer` is true).

| Variable | Type | Description |
| :--- | :--- | :--- |
| `isRetainer` | Boolean | True if this is a retainer invoice. |
| `retainerPercentage`| Number | The percentage value of the retainer (e.g., 50). |

### Balance Invoices
These variables are populated if the invoice is a **Balance Invoice** (`isBalance` is true).
*Note: The linked Retainer Invoice object is not currently passed to the template, only its ID and the deduction amount.*

| Variable | Type | Description |
| :--- | :--- | :--- |
| `isBalance` | Boolean | True if this is a balance invoice. |
| `retainerDeductionAmount` | Number | The amount deducted from the total (the paid retainer amount). Usage tip: You may want to format this number. |
| `retainerInvoiceId` | String | The ID of the linked retainer invoice. |

## Client Object (`client`)

Access these properties via `client.propertyName` (e.g., `{{client.name}}`).

| Property | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Client's name or company name. |
| `email` | String | Contact email address. |
| `address` | String | Street address. |
| `city` | String | City. |
| `zipCode` | String | Postal/Zip code. |
| `country` | String | Country name. |
| `phone` | String | Phone number. |
| `vatNumber` | String | VAT identification number. |
| `companyId` | String | Company registration ID (SIRET/SIREN). |

## Item Object (`items`)

Iterate over the items array using `{{#each items}} ... {{/each}}`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `title` | String | Short title of the item (optional). |
| `description` | String | Detailed description of the item. |
| `quantity` | Number | Quantity of the item. |
| `price` | String | Unit price, formatted with 2 decimal places. |
| `total` | String | Line total (Quantity * Price), formatted with 2 decimal places. |
| `vat` | Number | VAT percentage applicable to this item. |

## Example Usage

```html
<!-- Display Client Name -->
<h1>To: {{client.name}}</h1>

<!-- Iterate Items -->
<table>
    {{#each items}}
    <tr>
        <td>{{description}}</td>
        <td>{{quantity}}</td>
        <td>{{price}}</td>
        <td>{{total}}</td>
    </tr>
    {{/each}}
</table>

<!-- Show Retainer Deduction for Balance Invoice -->
{{#if isBalance}}
<div class="deduction">
    Less Retainer Amount: -{{retainerDeductionAmount}} {{currency}}
</div>
{{/if}}

<!-- Show Notes if present -->
{{#if notes}}
    <p>Notes: {{notes}}</p>
{{/if}}
```
