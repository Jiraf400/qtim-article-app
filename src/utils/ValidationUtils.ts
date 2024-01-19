export class ValidationUtils {
  static isValidPaginationParams(query: {
    page?: number;
    limit?: number;
  }): boolean {
    if (!query) {
      return true;
    }

    const { page, limit } = query;

    if (page !== undefined && (isNaN(page) || page <= 0)) {
      return false;
    }

    if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
      return false;
    }

    return true;
  }

  static isValidDateFormatDDMMYYYY(dateString: string): boolean {
    const dateFormatRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

    return dateFormatRegex.test(dateString);
  }
}
