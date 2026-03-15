using System;
using System.Collections.Generic;
using System.Text;

namespace RentNest.Infrastructure.Exceptions
{
    public class Conflict  :Exception
    {
        public int StatusCode = 409;
        public Conflict(string msg) : base(msg)
        {

        }
    }
}
