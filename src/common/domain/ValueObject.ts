/**
 * ValueObject interface
 * Check DDD https://martinfowler.com/bliki/ValueObject.html
 */
export interface ValueObject {
  /**
   * Validate object properties
   * @throws DomainError
   */
  validateObjectProperties(): void;

  /**
   * Compare two objects
   * @param anotherObject Another object to compare
   * @returns boolean True if the objects are equal, false otherwise
   */
  equals(anotherObject: unknown): boolean;
}
