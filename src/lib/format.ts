export function formatPrice(amount: number, currency: string, decimalSeparator: string = ","): string {
    const isCommaDecimal = decimalSeparator === ",";
    const thousandSeparator = isCommaDecimal ? " " : ",";
    const decimal = isCommaDecimal ? "," : ".";

    const formattedAmount = amount.toFixed(2)
        .replace(".", decimal)
        .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

    return `${formattedAmount} ${currency}`;
}
