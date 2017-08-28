#include <iostream>

using namespace std;

int main()
{
    float borc=50.0;
    int i =1;
    for (i=1;borc<=200;i++)
    {
        borc=borc+borc*0.02;
        cout << i << ".ay borc : " << borc << endl;
    }

    cout << i-1 << " ay sonra" << endl;
    return 0;
}
