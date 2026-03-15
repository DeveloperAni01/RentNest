
using RentNest.Infrastructure.Services.Auth;

[TestFixture]
public class PasswordTesting
{
    //test cases for password testing wrong and verify
    private readonly PasswordService _password = new();

    [Test]
    public void HashedPasswordTesting()
    {
        
        string original = "Ani@123";
        string hashedPassword = _password.PasswordHashing(original);
        Assert.That(hashedPassword, Is.Not.EqualTo(original));
    }

    [Test]
    public void VerifyingHashedPassword() 
    {
        string original = "Ani@123";
        string hashedPassword = _password.PasswordHashing(original);
        bool result = _password.VerifyUserPassword(original, hashedPassword);
        Assert.That(result, Is.True);
    }

    [Test]
    public void WrongPasswordTest()
    {
        string original = "Ani@123";
        string hashedPassword = _password.PasswordHashing(original);
        bool result = _password.VerifyUserPassword("WrongPassword!", hashedPassword);
        Assert.That(result, Is.False);
    }
}


[TestFixture]
public class TestingOtp
{
    //test cases for otp  //expired or not!
    [Test]
    public void OtpExpiryTesting()
    {
        
        DateTime expiry = DateTime.UtcNow.AddMinutes(10);
        bool isExpired = expiry < DateTime.UtcNow;
        Assert.That(isExpired, Is.False);
    }

    [Test]
    public void ExpiredOtpTest()
    { 
        DateTime expiry = DateTime.UtcNow.AddMinutes(-5);
        bool isExpired = expiry < DateTime.UtcNow;
        Assert.That(isExpired, Is.True);
    }
}


[TestFixture]
public class TestingReservationDates
{
    //etest cases for reservation date like chech-iin date should not past and check out date must not before chech-in
    [Test]
    public void TestCheckoutBefore()
    {
        DateTime checkIn = DateTime.UtcNow.Date.AddDays(8);
        DateTime checkOut = DateTime.UtcNow.Date.AddDays(5);
        bool isValid = checkOut > checkIn;
        Assert.That(isValid, Is.False);
    }

    [Test]
    public void PastDateTesting()
    {
        DateTime checkIn = DateTime.UtcNow.Date.AddDays(-3); 
        bool isValid = checkIn >= DateTime.UtcNow.Date;
        Assert.That(isValid, Is.False);
    }

    [Test]
    public void CalculationTesting()
    {
        DateTime checkIn = DateTime.UtcNow.Date.AddDays(5);
        DateTime checkOut = DateTime.UtcNow.Date.AddDays(10); 
        decimal pricePerNight = 2000;
        int totalNights = (checkOut - checkIn).Days;
        decimal totalAmount = totalNights * pricePerNight;
        Assert.That(totalNights, Is.EqualTo(5));
        Assert.That(totalAmount, Is.EqualTo(10000));
    }
}